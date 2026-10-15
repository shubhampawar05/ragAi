import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ data: { ok: true, service: "rag-lab-api" } });
});

export default router;
