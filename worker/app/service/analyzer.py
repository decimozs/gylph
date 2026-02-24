import cv2
import numpy as np
from typing import List, Tuple
from skimage.metrics import structural_similarity as ssim


class SignatureAnalyzer:
    def __init__(self, n_features: int = 1500):
        self.akaze = cv2.AKAZE_create()
        self.bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

    def extract_features(self, image: np.ndarray):
        return self.akaze.detectAndCompute(image, None)

    def _good_matches(self, des1, des2):
        if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
            return []

        matches = self.bf.knnMatch(des1, des2, k=2)
        good = []
        for m_n in matches:
            if len(m_n) == 2:
                m, n = m_n
                if m.distance < 0.85 * n.distance:
                    good.append(m)

        return sorted(good, key=lambda x: x.distance)[:300]

    def _get_coarse_translation(
        self, img: np.ndarray, ref_img: np.ndarray
    ) -> np.ndarray:
        def get_center(image):
            coords = cv2.findNonZero(image)
            if coords is None:
                return None
            x, y, w, h = cv2.boundingRect(coords)
            return (x + w // 2, y + h // 2)

        c_q = get_center(img)
        c_r = get_center(ref_img)

        if c_q is None or c_r is None:
            return np.eye(3, dtype=np.float32)

        dx = c_r[0] - c_q[0]
        dy = c_r[1] - c_q[1]
        return np.float32([[1, 0, dx], [0, 1, dy], [0, 0, 1]])

    def align_signatures(
        self, query_img: np.ndarray, ref_img: np.ndarray
    ) -> Tuple[np.ndarray, float]:
        T_coarse = self._get_coarse_translation(query_img, ref_img)
        coarse_query = cv2.warpPerspective(
            query_img, T_coarse, (ref_img.shape[1], ref_img.shape[0])
        )

        kp1, des1 = self.extract_features(coarse_query)
        kp2, des2 = self.extract_features(ref_img)

        if des1 is None or des2 is None or len(kp1) < 5:
            return coarse_query, 0.0

        good = self._good_matches(des1, des2)
        aligned_img = coarse_query
        is_stable = False
        inliers = 0

        if len(good) >= 6:
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

            if M is not None:
                det = np.linalg.det(M[:2, :2])
                if 0.4 < det < 2.5:
                    aligned_img = cv2.warpPerspective(
                        coarse_query, M, (ref_img.shape[1], ref_img.shape[0])
                    )
                    inliers = int(mask.ravel().sum())
                    is_stable = True

        if not is_stable:
            aligned_img = coarse_query
            inliers = len(good) // 1.5

        kernel = np.ones((5, 5), np.uint8)
        dil_query = cv2.dilate(aligned_img, kernel, iterations=1)
        dil_ref = cv2.dilate(ref_img, kernel, iterations=1)

        intersection = cv2.bitwise_and(dil_query, dil_ref)
        overlap_score = np.sum(intersection > 0) / max(np.sum(dil_ref > 0), 1)

        shape_score = ssim(aligned_img, ref_img, data_range=255)

        feature_score = min((len(good) / 40.0), 1.0)

        final_score = (
            (overlap_score * 0.5) + (shape_score * 0.3) + (feature_score * 0.2)
        )

        base_boost = 0.15
        final_score += base_boost

        if not is_stable:
            final_score *= 0.95
        else:
            final_score *= 1.05

        return aligned_img, float(np.clip(final_score, 0.0, 1.0))

    def get_overlap_viz(
        self, img1: np.ndarray, img2: np.ndarray, light_mode: bool = True
    ) -> np.ndarray:
        if img1.shape != img2.shape:
            img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

        if light_mode:
            h, w = img1.shape[:2]
            canvas = np.full((h, w, 3), 255, dtype=np.uint8)
            canvas[img1 > 0] = [0, 180, 0]
            canvas[img2 > 0] = [0, 0, 200]
            overlap_mask = cv2.bitwise_and(img1, img2)
            canvas[overlap_mask > 0] = [255, 0, 0]
            return canvas
        else:
            overlap = cv2.addWeighted(img1, 0.5, img2, 0.5, 0)
            return cv2.applyColorMap(overlap, cv2.COLORMAP_MAGMA)

    def get_feature_similarity(self, image1: np.ndarray, image2: np.ndarray) -> float:
        kp1, des1 = self.extract_features(image1)
        kp2, des2 = self.extract_features(image2)
        if des1 is None or des2 is None or len(kp1) == 0 or len(kp2) == 0:
            return 0.0
        good_matches = self._good_matches(des1, des2)
        return float(len(good_matches) / min(len(kp1), len(kp2)))

    def generate_fingerprint(self, processed_image: np.ndarray) -> List[float]:
        coords = cv2.findNonZero(processed_image)
        if coords is None:
            return [0.0] * 128

        x, y, w, h = cv2.boundingRect(coords)
        aspect_ratio = w / h if h > 0 else 0
        density = np.sum(processed_image > 0) / (w * h)

        _, descriptors = self.extract_features(processed_image)

        fingerprint = [aspect_ratio, density]

        if descriptors is not None:
            feat_flat = descriptors.flatten().astype(float) / 255.0
            fingerprint.extend(feat_flat[:126])

        if len(fingerprint) < 128:
            fingerprint.extend([0.0] * (128 - len(fingerprint)))

        return [float(x) for x in fingerprint[:128]]
