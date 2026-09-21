import pandas as pd


def detect_temperature_anomalies(df, threshold=2.0):
    df = df.copy()

    df["TEMP"] = pd.to_numeric(df["TEMP"], errors="coerce")

    mean_temp = df["TEMP"].mean()
    std_temp = df["TEMP"].std()

    if std_temp == 0 or pd.isna(std_temp):
        df["z_score"] = 0.0
        df["anomaly"] = False
        return df, mean_temp, std_temp

    df["z_score"] = (df["TEMP"] - mean_temp) / std_temp

    df["anomaly"] = df["z_score"].abs() >= threshold

    return df, mean_temp, std_temp