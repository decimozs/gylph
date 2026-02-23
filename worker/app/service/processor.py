import cv2
import numpy as np
import base64


class SignatureProcessor:
    def __init__(self, image_bytes: bytes):
        self.raw_image = self._decode(image_bytes)

    def _decode(self, image_bytes: bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Could not decode image. Ensure valid format.")
        return image

    def _apply_grayscale(self, image):
        if len(image.shape) < 3:
            return image
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    def _apply_blur(self, image, kernel_size=(3, 3)):
        return cv2.GaussianBlur(image, kernel_size, 0)

    def _apply_threshold(self, image):
        return cv2.adaptiveThreshold(
            image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 4
        )

    def _apply_morphology(self, image):
        repair_kernel = np.ones((1, 1), np.uint8)
        dilated_image = cv2.dilate(image, repair_kernel, iterations=1)

        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            dilated_image, connectivity=8
        )
        cleaned_binary = np.zeros_like(dilated_image)
        for j in range(1, num_labels):
            if stats[j, cv2.CC_STAT_AREA] > 60:
                cleaned_binary[labels == j] = 255

        connect_kernel = np.ones((3, 3), np.uint8)
        return cv2.morphologyEx(
            cleaned_binary, cv2.MORPH_CLOSE, connect_kernel, iterations=1
        )

    def _extract_valid_contours(self, closing_image):
        contours, _ = cv2.findContours(
            closing_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        if not contours:
            return []

        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        min_area_threshold = cv2.contourArea(contours[0]) * 0.05
        return [c for c in contours if cv2.contourArea(c) > min_area_threshold]

    def _prepare_siamese(self, image, target_size=(256, 256)):
        if image is None:
            raise ValueError("Input image is None.")

        h, w = image.shape[:2]
        scale = min(target_size[0] / w, target_size[1] / h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

        canvas = np.zeros((target_size[1], target_size[0]), dtype=np.uint8)
        x_offset = (target_size[0] - new_w) // 2
        y_offset = (target_size[1] - new_h) // 2
        canvas[y_offset : y_offset + new_h, x_offset : x_offset + new_w] = resized
        return canvas

    def _to_base64(self, image_np: np.ndarray) -> str:
        """Converts a numpy image array to a base64 string."""
        if image_np is None:
            return ""
        _, buffer = cv2.imencode(".png", image_np)
        return base64.b64encode(buffer).decode("utf-8")

    def _run_pipeline(self, image_data):
        grayscale = self._apply_grayscale(image_data)
        blurred = self._apply_blur(grayscale)
        thresholded = self._apply_threshold(blurred)
        return self._apply_morphology(thresholded)

    def get_visualization(self):
        """Returns the original image with bounding boxes and contours drawn."""
        orig_rgb = cv2.cvtColor(self.raw_image, cv2.COLOR_BGR2RGB)
        closing = self._run_pipeline(self.raw_image)
        valid_contours = self._extract_valid_contours(closing)

        visualization = orig_rgb.copy()
        if valid_contours:
            cv2.drawContours(visualization, valid_contours, -1, (0, 255, 0), 2)
            all_points = np.vstack(valid_contours)
            x, y, w, h = cv2.boundingRect(all_points)
            cv2.rectangle(visualization, (x, y), (x + w, y + h), (255, 0, 0), 2)

        return visualization

    def process(self):
        closing = self._run_pipeline(self.raw_image)
        valid_contours = self._extract_valid_contours(closing)

        roi = normalized = siamese = image_preview = closing

        if valid_contours:
            all_points = np.vstack(valid_contours)
            x, y, w, h = cv2.boundingRect(all_points)
            pad = 25

            img_h, img_w = closing.shape[:2]
            y1, y2 = max(0, y - pad), min(img_h, y + h + pad)
            x1, x2 = max(0, x - pad), min(img_w, x + w + pad)

            roi = closing[y1:y2, x1:x2]

            normalized = self._prepare_siamese(roi)
            siamese = self._prepare_siamese(roi)

            image_preview = cv2.bitwise_not(siamese)

        return {
            "roi": roi,
            "normalized": normalized,
            "siamese": siamese,
            "image_preview": image_preview,
        }
