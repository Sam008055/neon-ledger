import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, ExternalLink } from "lucide-react";

interface ReceiptViewerProps {
  receiptId: Id<"_storage">;
}

export function ReceiptViewer({ receiptId }: ReceiptViewerProps) {
  const receiptUrl = useQuery(api.budget.getReceiptUrl, { storageId: receiptId });

  if (!receiptUrl) return null;

  const isPdf = receiptUrl.includes('.pdf');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title="View receipt">
          <Eye className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Receipt
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(receiptUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh]">
          {isPdf ? (
            <iframe
              src={receiptUrl}
              className="w-full h-[60vh] border-0"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={receiptUrl}
              alt="Receipt"
              className="w-full h-auto rounded-md"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
