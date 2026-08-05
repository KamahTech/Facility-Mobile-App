import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";
import { getSessionId } from "@/lib/api-client";
import type { Invoice } from "@/stores/invoices-store";

/**
 * Downloads an invoice PDF from the backend endpoint (/resident/invoices/<id>/pdf)
 * using Bearer token authentication and prompts native file sharing/saving.
 */
export async function downloadInvoicePdf(invoice: Invoice): Promise<string> {
  const token = getSessionId();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const serverOrigin = API_BASE_URL.replace(/^(https?:\/\/[^/]+).*$/, "$1");

  let path: string;
  if (invoice.pdfUrl) {
    if (invoice.pdfUrl.startsWith("http://") || invoice.pdfUrl.startsWith("https://")) {
      path = invoice.pdfUrl;
    } else if (invoice.pdfUrl.startsWith("/")) {
      path = `${serverOrigin}${invoice.pdfUrl}`;
    } else {
      path = `${serverOrigin}/${invoice.pdfUrl}`;
    }
  } else {
    path = `${API_BASE_URL}/resident/invoices/${invoice.id}/pdf`;
  }

  const sanitizedInvoiceNum = (invoice.invoiceNumber || invoice.id).replace(
    /[/\\?%*:|"<>]/g,
    "_",
  );
  const fileName = `invoice_${sanitizedInvoiceNum}.pdf`;

  if (Platform.OS === "web") {
    const response = await axios.get(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return blobUrl;
  }

  const targetDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!targetDirectory) {
    throw new Error("Device storage directory is unavailable.");
  }

  const localUri = `${targetDirectory}${fileName}`;

  const downloadResult = await FileSystem.downloadAsync(path, localUri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (downloadResult.status !== 200) {
    throw new Error(`Download failed with status ${downloadResult.status}`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: "application/pdf",
      dialogTitle: fileName,
      UTI: "com.adobe.pdf",
    });
  }

  return downloadResult.uri;
}
