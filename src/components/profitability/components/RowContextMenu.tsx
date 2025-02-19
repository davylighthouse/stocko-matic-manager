
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Check, X } from "lucide-react"
import { TableRow } from "@/components/ui/table";

interface RowContextMenuProps {
  children: React.ReactNode;
  onVerify: () => void;
  onUnverify: () => void;
  verified: boolean;
  className?: string;
}

export const RowContextMenu = ({ children, onVerify, onUnverify, verified, className }: RowContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className={className}>
          {children}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {!verified ? (
          <ContextMenuItem onClick={onVerify}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Verified
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={onUnverify}>
            <X className="mr-2 h-4 w-4" />
            Remove Verification
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
