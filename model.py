import streamlit as st
import pickle
import pandas as pd

# Load pickle
with open("multi_disease_model.pkl", "rb") as f:
    saved_data = pickle.load(f)

models = saved_data["models"]
preprocessor = saved_data["preprocessor"]

st.title("Multi-Disease Prediction App")

# Choose which disease to predict
disease = st.selectbox("Select disease to predict:", list(models.keys()))
model_info = models[disease]
model = model_info["model"]
features = model_info["features"]

# Input fields for required features
inputs = {}
for feat in features:
    inputs[feat] = st.number_input(f"Enter {feat}:", value=0.0)

if st.button("Predict"):
    # Convert inputs into dataframe
    input_df = pd.DataFrame([inputs])

    # Apply preprocessing
    processed_df = preprocessor(input_df)

    # Keep only required features
    X = processed_df[features]

    # Predict
    prediction = model.predict(X)
    st.write(f"Prediction for {disease}: {prediction[0]}")
