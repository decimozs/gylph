import cv2
import numpy as np
from typing import List, Tuple


class SignatureAnalyzer:
    def __init__(self, n_features: int = 1500):
        self.orb = cv2.ORB_create(nfeatures=n_features)
        self.bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    def extract_features(self, image: np.ndarray):
        return self.orb.detectAndCompute(image, None)

    def align_signatures(
        self, query_img: np.ndarray, ref_img: np.ndarray
    ) -> Tuple[np.ndarray, float]:
        kp1, des1 = self.extract_features(query_img)
        kp2, des2 = self.extract_features(ref_img)

        if des1 is None or des2 is None or len(kp1) < 20:
            return query_img, 0.0

        matches = self.bf.match(des1, des2)
        matches = sorted(matches, key=lambda x: x.distance)

        if len(matches) < 20:
            return query_img, float(len(matches) / max(len(kp1), len(kp2)))

        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        if M is None:
            return query_img, 0.0

        det = np.linalg.det(M[:2, :2])
        if det < 0.2 or det > 5.0:
            return query_img, 0.0

        aligned_img = cv2.warpPerspective(
            query_img, M, (ref_img.shape[1], ref_img.shape[0])
        )

        score = float(len(matches) / max(len(kp1), len(kp2)))
        return aligned_img, score

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
        if des1 is None or des2 is None:
            return 0.0
        matches = self.bf.match(des1, des2)
        return float(len(matches) / max(len(kp1), len(kp2)))

    def generate_fingerprint(self, processed_image: np.ndarray) -> List[float]:
        _, descriptors = self.extract_features(processed_image)
        if descriptors is None:
            return [0.0] * 128
        fingerprint = (descriptors.flatten()[:128] / 255.0).astype(float)
        return fingerprint.tolist()
