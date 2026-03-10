import React from "react";
import "./ui.css";

export function Card({ children, className = "" }) {
  return <section className={`ui-card ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`ui-card-header ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`ui-card-title ${className}`.trim()}>{children}</h2>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={`ui-card-description ${className}`.trim()}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`ui-card-content ${className}`.trim()}>{children}</div>;
}
