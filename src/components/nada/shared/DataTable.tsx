import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DataTableColumn {
  key: string;
  header: string;
  className?: string;
}

interface DataTableRow {
  [key: string]: React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: DataTableRow[];
  forCapture?: boolean;
  delay?: number;
}

export const DataTable = ({
  columns,
  data,
  forCapture = false,
  delay = 0,
}: DataTableProps) => {
  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.5 }}
      className="overflow-hidden rounded-xl nada-glass-card"
    >
      <table className="nada-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={forCapture ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                forCapture
                  ? { duration: 0 }
                  : { delay: delay + rowIndex * 0.1, duration: 0.4 }
              }
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
