from fastapi import APIRouter, FastAPI, HTTPException, UploadFile, File
from app.service.processor import SignatureProcessor
from app.service.analyzer import SignatureAnalyzer
import uuid

app = FastAPI(
    title="Signature Verification Worker",
    version="1.0.0",
    description="A worker for verifying signatures.",
)

router = APIRouter(prefix="/signatures", tags=["signatures"])


@router.post("/capture-fingerprint")
async def capture_fingerprint(file: UploadFile = File(...)):
    if not (file.content_type and file.content_type.startswith("image/")):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only image files are allowed."
        )

    try:
        image_bytes = await file.read()
        processor = SignatureProcessor(image_bytes)
        processed_data = processor.process()
        cleaned_image = processed_data["siamese"]
        vis_image = processor.get_visualization()

        analyzer = SignatureAnalyzer()
        fingerprint = analyzer.generate_fingerprint(cleaned_image)

        return {
            "message": "Fingerprint captured successfully",
            "data": {
                "id": str(uuid.uuid4()),
                "fingerprint": fingerprint,
                "processsed_images": {
                    "vis": {
                        "id": str(uuid.uuid4()),
                        "image": processor._to_base64(vis_image),
                        "type": "vis",
                    },
                    "roi": {
                        "id": str(uuid.uuid4()),
                        "image": processor._to_base64(processed_data["roi"]),
                        "type": "roi",
                    },
                    "normalized": {
                        "id": str(uuid.uuid4()),
                        "image": processor._to_base64(processed_data["normalized"]),
                        "type": "normalized",
                    },
                    "preview": {
                        "id": str(uuid.uuid4()),
                        "image": processor._to_base64(processed_data["image_preview"]),
                        "type": "preview",
                    },
                },
                "metadata": {
                    "width": cleaned_image.shape[1],
                    "height": cleaned_image.shape[0],
                },
            },
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


@router.post("/verify")
async def verify_signature(
    file: UploadFile = File(...), reference_file: UploadFile = File(...)
):
    if not (file.content_type and file.content_type.startswith("image/")):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only image files are allowed."
        )

    try:
        live_bytes = await file.read()
        live_processor = SignatureProcessor(live_bytes)
        live_data = live_processor.process()

        ref_bytes = await reference_file.read()
        ref_processor = SignatureProcessor(ref_bytes)
        ref_data = ref_processor.process()

        analyzer = SignatureAnalyzer()
        aligned_live, similarity_score = analyzer.align_signatures(
            query_img=live_data["siamese"], ref_img=ref_data["siamese"]
        )

        is_authentic = False
        status = "forged"

        if similarity_score >= 0.25:
            is_authentic = True
            status = "authentic"
        elif similarity_score >= 0.15:
            is_authentic = False
            status = "uncertain (requires manual review)"
        elif similarity_score == 0:
            status = "rejected (no matching features)"

        overlap_viz = analyzer.get_overlap_viz(ref_data["siamese"], aligned_live)

        preview_overlap_viz = analyzer.get_overlap_viz(
            ref_data["siamese"], aligned_live, light_mode=True
        )

        return {
            "message": "Verification completed successfully",
            "data": {
                "id": str(uuid.uuid4()),
                "is_authentic": is_authentic,
                "status": status,
                "confidence_score": round(similarity_score, 4),
                "confidence_percentage": f"{round(similarity_score * 100, 2)}%",
                "visuals": {
                    "overlap_viz": {
                        "id": str(uuid.uuid4()),
                        "image": live_processor._to_base64(overlap_viz),
                        "type": "overlap_viz",
                    },
                    "live_normalized": {
                        "id": str(uuid.uuid4()),
                        "image": live_processor._to_base64(live_data["normalized"]),
                        "type": "live_normalized",
                    },
                    "reference_normalized": {
                        "id": str(uuid.uuid4()),
                        "image": ref_processor._to_base64(ref_data["normalized"]),
                        "type": "reference_normalized",
                    },
                    "preview_live_normalized": {
                        "id": str(uuid.uuid4()),
                        "image": live_processor._to_base64(live_data["image_preview"]),
                        "type": "preview_live_normalized",
                    },
                    "preview_ref_normalized": {
                        "id": str(uuid.uuid4()),
                        "image": ref_processor._to_base64(ref_data["image_preview"]),
                        "type": "preview_ref_normalized",
                    },
                    "preview_overlap_viz": {
                        "id": str(uuid.uuid4()),
                        "image": live_processor._to_base64(preview_overlap_viz),
                        "type": "preview_overlap_viz",
                    },
                },
            },
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.get("/")
def read_root():
    return {"Hello": "World"}


app.include_router(router)
