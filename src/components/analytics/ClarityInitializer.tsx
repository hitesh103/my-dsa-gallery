"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

export function ClarityInitializer() {
  useEffect(() => {
    clarity.init("w7irbyjl5u");
  }, []);

  return null;
}