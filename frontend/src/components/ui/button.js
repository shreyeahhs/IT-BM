import React from "react";
import "./ui.css";

const VARIANT_CLASS = {
  default: "ui-button--default",
  secondary: "ui-button--secondary",
  ghost: "ui-button--ghost",
};

const SIZE_CLASS = {
  default: "ui-button--size-default",
  sm: "ui-button--size-sm",
};

export function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.default;
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.default;

  return (
    <button
      className={`ui-button ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
