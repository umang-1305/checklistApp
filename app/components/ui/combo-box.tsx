// import React from "react";
// import { Button } from "./button";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandInput,
//   CommandList,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
// } from "@/components/ui/command";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface ComboboxProps {
//   value: string[]; // Multi-select array
//   onSelect: (value: string[]) => void; // Update to handle arrays
//   options: { value: string; label: string }[];
//   placeholder: string;
//   searchPlaceholder?: string;
//   disabled?: boolean;
//   className?: string;
// }

// const Combobox: React.FC<ComboboxProps> = ({
//   value = [], // Default to an empty array
//   onSelect,
//   options,
//   placeholder,
//   searchPlaceholder,
//   disabled,
//   className,
// }) => {
//   const [open, setOpen] = React.useState(false);

//   // Ensure value is always an array
//   const selectedValues = Array.isArray(value) ? value : [];

//   const handleSelect = (selectedValue: string) => {
//     let updatedValues;
//     if (selectedValues.includes(selectedValue)) {
//       // Remove the value if it's already selected
//       updatedValues = selectedValues.filter((v) => v !== selectedValue);
//     } else {
//       // Add the value if it's not selected
//       updatedValues = [...selectedValues, selectedValue];
//     }
//     onSelect(updatedValues); // Update the parent state
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           disabled={disabled}
//           className={cn(
//             "w-full justify-between border border-gray-300 bg-gray-50 text-gray-500",
//             className
//           )}
//         >
//           {selectedValues.length > 0
//             ? selectedValues
//                 .map(
//                   (selected) =>
//                     options.find((option) => option.value === selected)?.label
//                 )
//                 .join(", ")
//             : placeholder}
//           <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-full p-0">
//         <Command>
//           <CommandInput
//             placeholder={searchPlaceholder || `Search ${placeholder.toLowerCase()}...`}
//           />
//           <CommandList>
//             <CommandEmpty>No results found.</CommandEmpty>
//             <CommandGroup>
//               {options.map((option, index) => (
//                 <CommandItem
//                   key={option.value || index}
//                   value={option.value}
//                   onSelect={() => handleSelect(option.value)}
//                 >
//                   {option.label}
//                   <Check
//                     className={cn(
//                       "ml-auto h-4 w-4",
//                       selectedValues.includes(option.value)
//                         ? "opacity-100"
//                         : "opacity-0"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// };

// export default Combobox;
import React from "react";
import { Button } from "./button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string | string[]; // Accept both string and array for flexibility
  onSelect: (value: string | string[]) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder?: string;
  isSingleSelect?: boolean; // Add this prop to toggle single-select behavior
  disabled?: boolean;
  className?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  value = "",
  onSelect,
  options,
  placeholder,
  searchPlaceholder,
  isSingleSelect = false, // Default to multi-select
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    if (isSingleSelect) {
      // Single select behavior
      if (value !== selectedValue) {
        onSelect(selectedValue); // Update parent with the single value
      }
      setOpen(false); // Close the popover
    } else {
      // Multi-select behavior
      const selectedValues = Array.isArray(value) ? value : [];
      let updatedValues;
      if (selectedValues.includes(selectedValue)) {
        // Remove the value if it's already selected
        updatedValues = selectedValues.filter((v) => v !== selectedValue);
      } else {
        // Add the value if it's not selected
        updatedValues = [...selectedValues, selectedValue];
      }
      onSelect(updatedValues); // Update parent with the updated array
    }
  };

  const displayValue = isSingleSelect
    ? typeof value === "string"
      ? options.find((option) => option.value === value)?.label || placeholder
      : placeholder
    : Array.isArray(value)
    ? value
        .map((selected) => options.find((option) => option.value === selected)?.label)
        .join(", ")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between border border-gray-300 bg-gray-50 text-gray-500",
            className
          )}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder || `Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={option.value || index}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      (isSingleSelect && value === option.value) ||
                        (!isSingleSelect &&
                          Array.isArray(value) &&
                          value.includes(option.value))
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
