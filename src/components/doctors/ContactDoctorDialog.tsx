import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Doctor } from '@/types/doctor';
import { useHealthStore } from '@/store/healthStore';
import { FileText, Loader2, AlertCircle, FileUp, Check, ArrowUpCircle, Download, Calendar } from 'lucide-react';
import { generatePDF, downloadPDF } from '@/utils/pdfGenerator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';

interface ContactDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  appointmentDate?: Date;
}
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

export const ContactDoctorDialog: React.FC<ContactDoctorDialogProps> = ({
  isOpen,
  onClose,
  doctor,
  appointmentDate
}) => {
  const { toast } = useToast();
  const { healthData } = useHealthStore();
  const [message, setMessage] = useState('');
  const [shareHealthData, setShareHealthData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedAnalysisPrompt, setShowAdvancedAnalysisPrompt] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  React.useEffect(() => {
    if (appointmentDate) {
      const formattedDate = format(appointmentDate, 'EEEE, MMMM do, yyyy');
      setMessage(`Hi Dr. ${doctor.lastName}, I would like to schedule a consultation on ${formattedDate}.`);
    } else {
      setMessage(`Hi Dr. ${doctor.lastName}, I would like to schedule a consultation.`);
    }
  }, [appointmentDate, doctor.lastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (shareHealthData && !healthData.completedAdvancedAnalysis && !showAdvancedAnalysisPrompt) {
      setShowAdvancedAnalysisPrompt(true);
      return;
    } else if (message) {
      console.log(`Message to doctor: ${message} `);

      const token = localStorage.getItem('token');
      const doctor_Id = localStorage.getItem("doctor_Id");


      if (!token || !doctor_Id) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/auth/messageForDoctor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          
          doctorId:doctor_Id,
          messges : `Requested appointment date: ${appointmentDate ? format(appointmentDate, 'EEEE, MMMM do, yyyy') : ""}`,
          body:message

        }),
      });
    }











    setIsSubmitting(true);

    if (shareHealthData) {
      try {
        setPdfGenerating(true);
        const generatedPdf = await generatePDF(healthData, doctor);
        setPdfBlob(generatedPdf);
        setPdfGenerated(true);
        setPdfGenerating(false);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "PDF Generation Failed",
          description: "Could not generate health data PDF. Your request will be sent without the attachment.",
          variant: "destructive",
        });
        setPdfGenerating(false);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);

      toast({
        title: "Request sent successfully",
        description: `Your consultation request has been sent to Dr. ${doctor.lastName}.`,
      });

      setPdfGenerated(false);
      setShowAdvancedAnalysisPrompt(false);
      onClose();
    }, 1500);
  };

  const continueWithoutAdvancedAnalysis = () => {
    setShowAdvancedAnalysisPrompt(false);
    handleSubmit(new Event('submit') as any);
  };


  const handleDownloadPdf = async () => {
    if (pdfGenerated && pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health_report_for_dr_${doctor.lastName.toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: "PDF Downloaded",
        description: "Your health data PDF has been downloaded successfully.",
      });
    } else {
      try {
        setDownloadingPdf(true);
        await downloadPDF(healthData, doctor);
        setDownloadingPdf(false);

        toast({
          title: "PDF Downloaded",
          description: "Your health data PDF has been downloaded successfully.",
        });
      } catch (error) {
        setDownloadingPdf(false);
        toast({
          title: "Download Failed",
          description: "Could not download health data PDF. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const renderHealthDataDetails = () => {
    if (!shareHealthData) return null;

    return (
      <div className="mt-4 space-y-3">
        <div className="bg-muted p-3 rounded-md flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Common health data to be shared:</p>
            <ul className="list-disc ml-5 mt-1 text-muted-foreground">
              <li>Age: {healthData.age} years</li>
              <li>Gender: {healthData.gender}</li>
              <li>Height: {healthData.height} cm</li>
              <li>Weight: {healthData.weight} kg</li>
              <li>BMI: {(healthData.weight / Math.pow(healthData.height / 100, 2)).toFixed(1)}</li>
              {healthData.bloodGlucose && <li>Blood Glucose: {healthData.bloodGlucose} mg/dL</li>}
            </ul>
          </div>
        </div>

        {healthData.completedAdvancedAnalysis ? (
          <div className="bg-muted p-3 rounded-md flex items-start gap-3">
            <ArrowUpCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Advanced health analysis will be shared:</p>
              <ul className="list-disc ml-5 mt-1 text-muted-foreground">
                <li>Lifestyle factors (sleep, exercise, stress)</li>
                <li>Nutrition habits and dietary preferences</li>
                <li>Medical history and conditions</li>
                <li>Health risk assessments</li>
                <li>Personalized health recommendations</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">Advanced health analysis not yet completed</p>
              <p className="mt-1 text-amber-700 dark:text-amber-400/80">
                For more accurate consultation, we recommend completing your advanced health analysis before contacting the doctor.
              </p>
            </div>
          </div>
        )}

        {pdfGenerated && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 p-3 rounded-md flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-green-800 dark:text-green-300">PDF Report Ready</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-white dark:bg-transparent border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                >
                  {downloadingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-1 text-green-700 dark:text-green-400/80">
                Your health data PDF has been generated and will be shared with Dr. {doctor.lastName}.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Request Consultation</DialogTitle>
            <DialogDescription>
              Send a message to Dr. {doctor.firstName} {doctor.lastName} to request a consultation.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 h-[calc(90vh-200px)] overflow-y-auto">
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {appointmentDate && (
                  <div className="bg-primary/10 p-3 rounded-md flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Requested appointment date:</p>
                      <p className="mt-1 text-primary font-medium">
                        {format(appointmentDate, 'EEEE, MMMM do, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Available hours: {doctor.availability?.hours || '9:00 AM - 5:00 PM'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder={`Hi Dr. ${doctor.lastName}, I would like to schedule a consultation about...`}
                    className="resize-none"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="share-data"
                    checked={shareHealthData}
                    onCheckedChange={(checked) => setShareHealthData(!!checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="share-data"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Share my health data with Dr. {doctor.lastName}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      This includes your detailed health profile and analysis results in PDF format.
                    </p>
                  </div>
                </div>

                {renderHealthDataDetails()}

                {shareHealthData && !pdfGenerated && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex gap-1"
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download Sample PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || pdfGenerating || downloadingPdf}
              className="sm:order-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || pdfGenerating || downloadingPdf}
              className="sm:order-2 w-full sm:w-auto"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : pdfGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  {shareHealthData && (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showAdvancedAnalysisPrompt}
        onOpenChange={setShowAdvancedAnalysisPrompt}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advanced Health Analysis Missing</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't completed your advanced health analysis yet. For more accurate consultation,
              we recommend completing it first. Dr. {doctor.lastName} will only receive your basic health data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAdvancedAnalysisPrompt(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={continueWithoutAdvancedAnalysis}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
