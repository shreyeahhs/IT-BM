import React from "react";
import "./ui.css";

export function Card({ children, className = "" }) {
  return <section className={`ui-card ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`ui-card-header ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ children, className = "", ...props}) {
  return <h2 className={`ui-card-title ${className}`.trim()}{...props}>{children}</h2>;
}

export function CardDescription({ children, className = "" , ...props}) {
  return <p className={`ui-card-description ${className}`.trim()}{...props}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`ui-card-content ${className}`.trim()}>{children}</div>;
}
