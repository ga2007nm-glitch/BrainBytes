import { useCallback, useEffect, useRef, useState } from "react";
import { loadFighterModels, saveFighterModel } from "./modelStore";

export default function useFighterModels() {
  const [models, setModels] = useState({ player: null, opponent: null });
  const [storageError, setStorageError] = useState("");
  const objectUrls = useRef(new Set());

  useEffect(() => {
    let active = true;
    loadFighterModels()
      .then((savedModels) => {
        if (!active) return;
        const loaded = { player: null, opponent: null };
        for (const slot of ["player", "opponent"]) {
          const model = savedModels[slot];
          if (!model) continue;
          const url = URL.createObjectURL(model.blob);
          objectUrls.current.add(url);
          loaded[slot] = { name: model.name, url };
        }
        setModels(loaded);
      })
      .catch((error) => {
        if (active) setStorageError(error instanceof Error ? error.message : "Saved 3D models could not be loaded.");
      });

    return () => {
      active = false;
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    };
  }, []);

  const upload = useCallback(async (slot, file) => {
    const savedModel = await saveFighterModel(slot, file);
    const url = URL.createObjectURL(savedModel.blob);
    objectUrls.current.add(url);
    setModels((current) => ({ ...current, [slot]: { name: savedModel.name, url } }));
    setStorageError("");
  }, []);

  return { models, storageError, upload };
}
