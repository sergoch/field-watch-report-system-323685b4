
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IncidentType } from "@/types";
import { format } from "date-fns";
import { Camera, MapPin, AlertTriangle, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewIncidentPage() {
  const [type, setType] = useState<IncidentType>("Damage");
  const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null }>({ latitude: null, longitude: null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [description, setDescription] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current date formatted
  const currentDate = format(new Date(), "yyyy-MM-dd");

  const handleDetectLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please try again or enter coordinates manually.",
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: "Location Not Available",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  };

  const handleImageCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!imagePreview) {
      toast({
        title: "Image Required",
        description: "Please capture or upload an image of the incident.",
        variant: "destructive",
      });
      return;
    }
    
    if (!location.latitude || !location.longitude) {
      toast({
        title: "Location Required",
        description: "Please detect your location or enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, call API to save the incident
    toast({
      title: "Incident Reported",
      description: `${type} incident has been reported successfully.`,
    });
    
    navigate("/incidents");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report Incident</h1>
        <p className="text-muted-foreground">Document and report field incidents</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Date</Label>
                <Input type="date" value={currentDate} readOnly />
              </div>
              
              <div>
                <Label className="mb-2 block">Incident Type</Label>
                <RadioGroup defaultValue="damage" value={type} onValueChange={(value) => setType(value as IncidentType)}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Cut" id="cut" />
                      <Label htmlFor="cut">Cut</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Parallel" id="parallel" />
                      <Label htmlFor="parallel">Parallel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Damage" id="damage" />
                      <Label htmlFor="damage">Damage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Node" id="node" />
                      <Label htmlFor="node">Node</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Hydrant" id="hydrant" />
                      <Label htmlFor="hydrant">Hydrant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Chamber" id="chamber" />
                      <Label htmlFor="chamber">Chamber</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="description" className="mb-2 block">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe the incident in detail..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <div className="mb-4 flex justify-center gap-2">
                  <Button type="button" onClick={handleImageCapture} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button type="button" variant="outline" onClick={handleImageCapture} className="flex-1">
                    <FileImage className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                
                {imagePreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <img 
                      src={imagePreview} 
                      alt="Incident" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-md">
                      {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md h-48 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>No image captured</p>
                    <p className="text-xs">Click a button above to take or upload a photo</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button 
                    type="button" 
                    onClick={handleDetectLocation}
                    disabled={isLoadingLocation}
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {isLoadingLocation ? "Detecting..." : "Detect My Location"}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input 
                      id="latitude"
                      type="text"
                      placeholder="e.g. 41.7151"
                      value={location.latitude !== null ? location.latitude.toString() : ""}
                      onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) || null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input 
                      id="longitude"
                      type="text"
                      placeholder="e.g. 44.8271"
                      value={location.longitude !== null ? location.longitude.toString() : ""}
                      onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) || null })}
                    />
                  </div>
                </div>
                
                {location.latitude && location.longitude ? (
                  <div className="mt-4 p-2 bg-muted/50 rounded-md text-center">
                    <p className="text-xs font-mono">
                      Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate("/incidents")}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
