import React from 'react';

interface Maker {
  id: number;
  name: string;
}

interface MultiSelectMakersProps {
  allMakers: Maker[];
  selectedMakerIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const MultiSelectMakers: React.FC<MultiSelectMakersProps> = ({
  allMakers,
  selectedMakerIds,
  onSelectionChange,
}) => {
  const handleCheckboxChange = (makerId: string) => {
    const isSelected = selectedMakerIds.includes(makerId);
    if (isSelected) {
      onSelectionChange(selectedMakerIds.filter((id) => id !== makerId));
    } else {
      onSelectionChange([...selectedMakerIds, makerId]);
    }
  };

  return (
    <div className="space-y-2 border p-3 rounded-lg bg-gray-50">
      {allMakers.map((maker) => (
        <label key={maker.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            value={maker.id}
            checked={selectedMakerIds.includes(String(maker.id))}
            onChange={() => {
              console.log('Checkbox changed for maker:', maker.name, 'ID:', maker.id, 'String ID:', String(maker.id));
              handleCheckboxChange(String(maker.id));
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{maker.name}</span>
        </label>
      ))}
    </div>
  );
};

export default MultiSelectMakers;
