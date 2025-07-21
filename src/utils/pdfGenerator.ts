import { jsPDF } from 'jspdf';
import { HealthData } from '@/store/healthStore';
import { Doctor } from '@/types/doctor';

// Helper function to add a watermark on the current page
const addWatermark = (doc: jsPDF) => {
    doc.saveGraphicsState();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(60);
    doc.setTextColor(150, 150, 150);
    doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
    });
    doc.restoreGraphicsState();
};

// Helper: fetch an image from the public folder and convert it to Base64
const fetchImageAsBase64 = async (path: string): Promise<string> => {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert image to Base64.'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading image blob.'));
        reader.readAsDataURL(blob);
    });
};

export const generatePDF = async (
    healthData: HealthData,
    doctor: Doctor
): Promise<Blob> => {
    // 1) Fetch the logo from /public/logo.png
    const logoBase64 = await fetchImageAsBase64('/logo.png');

    // 2) Create a new PDF document
    const doc = new jsPDF();
    addWatermark(doc);

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 3) Add the logo near the top-left corner
    // Insert your logo near the top-left corner while preserving aspect ratio
    // The height is set to 0 so jsPDF calculates it automatically based on the original aspect ratio.
    doc.addImage(logoBase64, 'PNG', 10, 10, 50, 0);

    // Move your title down so it doesn’t overlap the logo
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Health Data Report', pageWidth / 2, 15, { align: 'center' });

    // Add doctor information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
        `Generated for Dr. ${doctor.firstName} ${doctor.lastName}`,
        pageWidth / 2,
        25,
        { align: 'center' }
    );
    doc.setFontSize(12);
    doc.text(`Specialty: ${doctor.specialty}`, pageWidth / 2, 32, {
        align: 'center',
    });

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, {
        align: 'center',
    });

    // Separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 42, pageWidth - 20, 42);

    // Basic Health Information
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Basic Health Information', 20, 50);

    doc.setFontSize(12);
    const basicInfo = [
        `Age: ${healthData.age || 'Not provided'} years`,
        `Gender: ${healthData.gender || 'Not provided'}`,
        `Height: ${healthData.height || 'Not provided'} cm`,
        `Weight: ${healthData.weight || 'Not provided'} kg`,
        `BMI: ${healthData.bmi || 'Not calculated'} (${healthData.bmiCategory || 'Not categorized'})`,
        `Blood Glucose: ${healthData.bloodGlucose || 'Not provided'} mg/dL`,
    ];

    let yPos = 58;
    basicInfo.forEach((info) => {
        doc.text(`• ${info}`, 25, yPos);
        yPos += 8;
    });

    // Advanced health info
    if (healthData.completedAdvancedAnalysis) {
        doc.setDrawColor(220, 220, 220);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Advanced Health Analysis', 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        const scores = [
            `Overall Health Score: ${healthData.overallAdvancedScore || 'Not available'}/100`,
            `Sleep Quality Score: ${healthData.sleepScore || 'Not available'}/100`,
            `Exercise & Activity Score: ${healthData.exerciseScore || 'Not available'}/100`,
            `Stress Management Score: ${healthData.stressScore || 'Not available'}/100`,
            `Hydration Score: ${healthData.hydrationScore || 'Not available'}/100`,
        ];

        scores.forEach((score) => {
            doc.text(`• ${score}`, 25, yPos);
            yPos += 8;
        });

        if (healthData.savedAnalysis && healthData.savedAnalysis.length > 0) {
            yPos += 5;
            doc.setFontSize(14);
            doc.text('Detailed Analysis:', 20, yPos);
            yPos += 8;

            doc.setFontSize(11);
            healthData.savedAnalysis.forEach((section) => {
                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    addWatermark(doc);
                    yPos = 20;
                }

                doc.setTextColor(0, 102, 204);
                doc.text(section.title, 20, yPos);
                yPos += 6;

                doc.setTextColor(0, 0, 0);
                const splitAnalysis = doc.splitTextToSize(section.analysis, 170);
                splitAnalysis.forEach((line) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        addWatermark(doc);
                        yPos = 20;
                    }
                    doc.text(line, 25, yPos);
                    yPos += 6;
                });

                doc.setTextColor(0, 150, 0);
                doc.text('Recommendation:', 25, yPos);
                yPos += 6;

                doc.setTextColor(0, 0, 0);
                const splitRecommendation = doc.splitTextToSize(section.recommendation, 160);
                splitRecommendation.forEach((line) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        addWatermark(doc);
                        yPos = 20;
                    }
                    doc.text(line, 30, yPos);
                    yPos += 6;
                });

                yPos += 5;
            });
        }
    } else {
        // No advanced analysis
        yPos += 10;
        doc.setTextColor(150, 0, 0);
        doc.text('Note: Advanced health analysis has not been completed.', 20, yPos);
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Draw line above the footer
        doc.setDrawColor(220, 220, 220);
        doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(
            `Health Connect - Confidential Patient Data - Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
        );
    }

    // Return the PDF as a blob
    return doc.output('blob');
};

export const downloadPDF = async (
    healthData: HealthData,
    doctor: Doctor
): Promise<void> => {
    try {
        const pdfBlob = await generatePDF(healthData, doctor);
        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `health_report_for_dr_${doctor.lastName.toLowerCase()}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};
