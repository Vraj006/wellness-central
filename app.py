from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# import preprocessing_df so pickle can resolve it
from model import preprocessing_df

# Load models + preprocessor
bundle = joblib.load("multi_disease_model.pkl")
models = bundle["models"]
preprocessor = bundle["preprocessor"]

# Initialize FastAPI app
app = FastAPI()

# Input schema
class InputData(BaseModel):
    Age: float
    Gender: int
    BMI: float
    Exercise: float
    Diet: float
    Stress: float
    Glucose: float
    Weight: float
    BP_sys: float
    BP_dia: float
    HR: float
    AirQuality: float
    Sleep: float
    Steps: float
    disease: str   # "P_T2D", "P_HTN", or "P_HD"


@app.post("/predict")
def predict(data: InputData):
    try:
        disease = data.disease
        if disease not in models:
            return {"error": "Invalid disease. Choose from P_T2D, P_HTN, P_HD."}

        # Convert input to dataframe
        df = pd.DataFrame([data.dict(exclude={"disease"})])

        # Apply preprocessing
        df = preprocessor(df)

        # Select features for this disease
        features = models[disease]["features"]

        # Predict
        prediction = models[disease]["model"].predict(df[features])

        return {
            "disease": disease,
            "prediction": float(prediction[0])  # ensure it's JSON serializable
        }
    except Exception as e:
        return {"error": str(e)}
