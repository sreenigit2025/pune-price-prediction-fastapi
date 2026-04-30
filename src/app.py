from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from src.schemas import PropertyInput, PriceResponse, HealthResponse, ModelInfoResponse
from src.inference import predict_price, get_model_info

app = FastAPI(
    title="Property Price Prediction API",
    description="Inference pipeline for estimating property prices with confidence intervals.",
    version="1.0.0"
)

FRONTEND_DIR = "frontend"

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/results")
def serve_results():
    return FileResponse(os.path.join(FRONTEND_DIR, "results.html"))

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="API is healthy and running.")

@app.get("/model/info", response_model=ModelInfoResponse)
def model_info():
    info = get_model_info()
    return ModelInfoResponse(**info)

@app.post("/predict", response_model=PriceResponse)
def predict(data: PropertyInput):
    result = predict_price(data)
    return PriceResponse(**result)