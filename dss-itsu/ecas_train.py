"""
Innovación para reducir deserción en ITSU
ECAS: Entrenamiento de Regresión Logística con SHAP para riesgo de deserción.

Uso:
  - Requiere: pip install scikit-learn shap numpy pandas
  - Ejecutar en este directorio: python ecas_train.py
  - Guarda coeficientes en data/model.json
"""

import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
import shap


def load_data(path="data/encuesta.json"):
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    rows = []
    for r in raw:
        rows.append({
            "visual_score": r["scores"]["visual"],
            "activo_score": r["scores"]["activo"],
            "nota1": r["nota1"],
            "nota2": r["nota2"],
            "asistencia": r["asistencia"],
            "deserto": r["deserto"],
            "nombre": r["nombre"],
            "paralelo": r["paralelo"],
        })
    df = pd.DataFrame(rows)
    # Normalización sencilla a 0-1
    df["visual_score"] = df["visual_score"] / 11.0
    df["activo_score"] = df["activo_score"] / 11.0
    df["nota1"] = df["nota1"] / 10.0
    df["nota2"] = df["nota2"] / 10.0
    df["asistencia"] = df["asistencia"] / 100.0
    return df


def train_and_explain(df):
    X = df[["visual_score", "activo_score", "nota1", "nota2", "asistencia"]].values
    y = df["deserto"].values
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    proba = model.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, proba)
    print(f"AUC = {auc:.3f}")

    # SHAP explicabilidad
    explainer = shap.Explainer(model, X)
    shap_values = explainer(X)
    # Ejemplo: guardar waterfall del primer caso (opcional)
    # shap.plots.waterfall(shap_values[0])

    # Guardar coeficientes en JSON (para frontend)
    coefs = model.coef_[0]
    intercept = float(model.intercept_[0])
    payload = {
        "intercept": intercept,
        "coefs": {
            "visual": float(coefs[0]),
            "activo": float(coefs[1]),
            "nota1": float(coefs[2]),
            "nota2": float(coefs[3]),
            "asistencia": float(coefs[4]),
        }
    }
    with open("data/model.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print("Guardado: data/model.json")


if __name__ == "__main__":
    df = load_data()
    train_and_explain(df)

