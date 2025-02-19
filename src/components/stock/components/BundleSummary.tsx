
interface BundleSummaryProps {
  expectedStock: number;
  expectedCost: number;
}

export const BundleSummary = ({ expectedStock, expectedCost }: BundleSummaryProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-semibold mb-2">Bundle Summary</h3>
      <p>Expected Stock: {expectedStock}</p>
      <p>Expected Cost: £{expectedCost.toFixed(2)}</p>
    </div>
  );
};
