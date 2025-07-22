"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Upload } from "lucide-react";

export function Base64EncoderTool() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [base64String, setBase64String] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [decodedImage, setDecodedImage] = React.useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64String(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Decode = () => {
    if (!base64String.trim()) {
      alert("Por favor ingresa un código Base64");
      return;
    }

    try {
      // Verificar si es una imagen válida
      if (!base64String.startsWith("data:image/")) {
        alert("El código Base64 no parece ser una imagen válida");
        return;
      }

      setDecodedImage(base64String);
    } catch (error) {
      alert("Error al decodificar el Base64");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64String);
      alert("Código Base64 copiado al portapapeles");
    } catch (error) {
      alert("Error al copiar al portapapeles");
    }
  };

  const downloadImage = () => {
    if (!decodedImage && !imagePreview) {
      alert("No hay imagen para descargar");
      return;
    }

    const link = document.createElement("a");
    link.href = decodedImage || imagePreview;
    link.download = `imagen_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Codificar Imagen</TabsTrigger>
          <TabsTrigger value="decode">Decodificar Base64</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Codificar Imagen a Base64</CardTitle>
              <CardDescription>
                Selecciona una imagen para convertirla a código Base64
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-file">Seleccionar Imagen</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              {imagePreview && (
                <div className="space-y-4">
                  <div>
                    <Label>Vista Previa</Label>
                    <div className="mt-2 border rounded-lg p-4 flex justify-center">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full max-h-64 object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Código Base64</Label>
                    <Textarea
                      value={base64String}
                      readOnly
                      className="mt-2 h-32"
                      placeholder="El código Base64 aparecerá aquí..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Base64
                    </Button>
                    <Button onClick={downloadImage} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Imagen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decodificar Base64 a Imagen</CardTitle>
              <CardDescription>
                Pega el código Base64 para convertirlo a imagen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="base64-input">Código Base64</Label>
                <Textarea
                  id="base64-input"
                  value={base64String}
                  onChange={(e) => setBase64String(e.target.value)}
                  className="mt-2 h-32"
                  placeholder="Pega aquí el código Base64..."
                />
              </div>

              <Button onClick={handleBase64Decode}>
                <Upload className="h-4 w-4 mr-2" />
                Decodificar
              </Button>

              {decodedImage && (
                <div className="space-y-4">
                  <div>
                    <Label>Imagen Decodificada</Label>
                    <div className="mt-2 border rounded-lg p-4 flex justify-center">
                      <img
                        src={decodedImage || "/placeholder.svg"}
                        alt="Decoded"
                        className="max-w-full max-h-64 object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Base64
                    </Button>
                    <Button onClick={downloadImage} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Imagen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
