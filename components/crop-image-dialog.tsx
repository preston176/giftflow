"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCroppedImg } from "@/lib/crop-image";
import { Loader2 } from "lucide-react";

interface CropImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

export function CropImageDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: CropImageDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropCompleteInternal = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsCropping(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsCropping(false);
    }
  };

  const handleCancel = () => {
    // Reset state
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop Product Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cropper Container */}
          <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={setZoom}
            />
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isCropping}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            disabled={isCropping || !croppedAreaPixels}
          >
            {isCropping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cropping...
              </>
            ) : (
              "Apply Crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
