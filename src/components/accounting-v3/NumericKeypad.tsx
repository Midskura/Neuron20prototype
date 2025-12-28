import { useState } from "react";
import { Button } from "../ui/button";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
}

export function NumericKeypad({ value, onChange }: NumericKeypadProps) {
  const [expression, setExpression] = useState(value || "");

  const handleKeyPress = (key: string) => {
    if (key === "=") {
      try {
        // Evaluate the expression
        const result = eval(expression);
        const formatted = parseFloat(result.toFixed(2)).toString();
        setExpression(formatted);
        onChange(formatted);
      } catch {
        // Invalid expression, keep current
      }
    } else if (key === "C") {
      setExpression("");
      onChange("");
    } else if (key === "⌫") {
      const newExpr = expression.slice(0, -1);
      setExpression(newExpr);
      onChange(newExpr);
    } else {
      const newExpr = expression + key;
      setExpression(newExpr);
      onChange(newExpr);
    }
  };

  const keys = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="space-y-2">
      <div className="p-4 bg-[#F9FAFB] rounded-lg text-right text-[32px] tabular-nums min-h-[60px] flex items-center justify-end">
        {expression || "0"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.flat().map((key) => (
          <Button
            key={key}
            variant="outline"
            className="h-12 text-[18px]"
            onClick={() => handleKeyPress(key)}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-12 text-[14px] col-span-2"
          onClick={() => handleKeyPress("C")}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          className="h-12 text-[14px] col-span-2"
          onClick={() => handleKeyPress("⌫")}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
