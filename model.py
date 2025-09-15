import pandas as pd
import joblib
from sklearn.preprocessing import PowerTransformer, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.impute import SimpleImputer

# ---------------- Preprocessing Function ----------------
def preprocessing_df(df):
    if "Timestamp" in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        df["Month"] = df["Timestamp"].dt.month
        df["Day"] = df["Timestamp"].dt.day
        df.drop(columns=["Timestamp"], inplace=True, errors="ignore")
    else:
        df["Month"] = 0
        df["Day"] = 0

    gender_map = {"Male": 1, "Female": 2}
    location_map = {'TX':9, 'NY':8, 'MI':7, 'FL':6, 'IL':5,
                    'WA':4, 'GA':3, 'PA':2, 'MA':1, 'CA':0}
    exercise_map = {'3/wk run':3, '1/wk walk':2, '5/wk yoga':5,
                    'Sedentary':1, '2/wk gym':4}
    diet_map = {"Balanced": 5, "Mixed": 3, "High-carb": 2, "High-fat": 1}
    stress_map = {"Low": 1, "Medium": 3, "High": 5}
    airquality_map = {"Good": 5, "Moderate": 3, "Fair": 2, "Poor": 1}

    if "Gender" in df.columns: df['Gender'] = df['Gender'].map(gender_map)
    if "Location" in df.columns: df['Location'] = df['Location'].map(location_map)
    if "Exercise" in df.columns: df['Exercise'] = df['Exercise'].map(exercise_map)
    if "Diet" in df.columns: df['Diet'] = df['Diet'].map(diet_map)
    if "Stress" in df.columns: df['Stress'] = df['Stress'].map(stress_map)
    if "AirQuality" in df.columns: df['AirQuality'] = df['AirQuality'].map(airquality_map)

    numeric_cols = ['Age', 'BP_sys', 'BP_dia', 'Glucose', 'HR',
                    'Weight', 'BMI', 'Sleep', 'Steps']
    numeric_cols = [col for col in numeric_cols if col in df.columns]
    if numeric_cols:
        imputer = SimpleImputer(strategy='median')
        df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

        pt = PowerTransformer(method='yeo-johnson', standardize=True)
        df[numeric_cols] = pt.fit_transform(df[numeric_cols])

        scaler = MinMaxScaler(feature_range=(0, 1))
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    return df

# ---------------- Training Function ----------------
def train_models(df):
    df = preprocessing_df(df)

    y = df[['P_T2D', 'P_HTN', 'P_HD']]

    common_features = ['Age', 'Gender', 'BMI', 'Exercise', 'Diet', 'Stress']
    features_map = {
        'P_T2D': common_features + ['Glucose', 'Weight'],
        'P_HTN': common_features + ['BP_sys', 'BP_dia', 'Weight'],
        'P_HD' : common_features + ['HR','AirQuality','Sleep','Steps','Weight','BP_sys','BP_dia']
    }

    models = {}
    results = {}

    for target, features in features_map.items():
        valid_features = [f for f in features if f in df.columns]
        X = df[valid_features]
        y_target = y[target]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y_target, test_size=0.2, random_state=42
        )

        model = RandomForestRegressor(n_estimators=500, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        models[target] = {"model": model, "features": valid_features}
        results[target] = {"MSE": mse, "R2": r2}

    return models, results

# ---------------- Example Usage ----------------
if __name__ == "__main__":
    df = pd.read_csv("synthetic_patient_dataset.csv")  # update path if needed
    models, results = train_models(df)

    # Save trained models + function reference
    joblib.dump({"models": models, "preprocessor": preprocessing_df}, "multi_disease_model.pkl")
    print("Models trained and saved successfully!")
