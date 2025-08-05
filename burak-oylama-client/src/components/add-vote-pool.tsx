import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import VoteServices from "../services/vote.tsx";

interface VoteOption {
    id: number;
    value: string;
}

interface VoteModalProps {
    onClose: () => void;
    onSubmit: (voteName: string, endDate: string, options: string[]) => void;
}

const AddVotePool: React.FC<VoteModalProps> = ({ onClose, onSubmit }) => {
    const [voteName, setVoteName] = useState("");
    const [endDate, setEndDate] = useState("");
    const [options, setOptions] = useState<VoteOption[]>([
        { id: 1, value: "" },
        { id: 2, value: "" },
    ]);

    const addOption = () => {
        setOptions((prev) => [...prev, { id: prev.length + 1, value: "" }]);
    };

    const updateOption = (id: number, val: string) => {
        setOptions((prev) =>
            prev.map((opt) => (opt.id === id ? { ...opt, value: val } : opt))
        );
    };

    const handleSubmit = async () => {

        if (!voteName.trim()) {
            alert("Please enter vote name.");
            return;
        }
        if (!endDate) {
            alert("Please select end date.");
            return;
        }
        const filledOptions = options.filter((opt) => opt.value.trim() !== "");
        if (filledOptions.length < 2) {
            alert("Please provide at least 2 options.");
            return;
        }

        const dto = {
            name: voteName.trim(),
            voteOptions: filledOptions.map((opt) => opt.value.trim()),
            lastValidDate: new Date(endDate).toISOString(),
        };

        const result = await VoteServices.createVote(dto);

        if (result.success) {
            alert("Vote created successfully!");
            onSubmit(voteName, endDate, dto.voteOptions);
            onClose(); // Close modal after success
        } else {
            alert(`Failed to create vote: ${result.error || "Unknown error"}`);
        }
    };

    return (
        <div className="vote-modal-backdrop">
            <div className="vote-modal">
                <button className="close-btn" onClick={onClose} aria-label="Close modal">
                    <X size={24} />
                </button>

                <h2>Create New Vote</h2>

                <label>
                    Vote Name:
                    <input
                        type="text"
                        value={voteName}
                        onChange={(e) => setVoteName(e.target.value)}
                        placeholder="Enter vote name"
                    />
                </label>

                <label>
                    End Date:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </label>

                <div className="options-container">
                    <label>Options:</label>
                    {options.map(({ id, value }) => (
                        <input
                            key={id}
                            type="text"
                            value={value}
                            onChange={(e) => updateOption(id, e.target.value)}
                            placeholder={`Option ${id}`}
                        />
                    ))}

                    <button className="add-option-btn" onClick={addOption} aria-label="Add option">
                        <Plus size={20} /> Add option
                    </button>
                </div>

                <button className="submit-btn" onClick={handleSubmit}>
                    Create Vote
                </button>
            </div>

            {/* --- CSS Styles --- */}
            <style jsx>{`
              .vote-modal-backdrop {
                color: white;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
              }

              .vote-modal {
                background: #e85dec;
                padding: 2rem;
                border-radius: 8px;
                width: 400px;
                max-width: 90vw;
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: transparent;
                border: none;
                cursor: pointer;
                color: #ffffff;
                transition: color 0.2s ease;
              }

              .close-btn:hover {
                color: #c14ad0;
              }

              label {
                display: flex;
                flex-direction: column;
                font-weight: 600;
                font-size: 1rem;
                gap: 0.25rem;
                color: white;
              }

              input[type="text"],
              input[type="date"] {
                color: #343131;
                padding: 0.5rem;
                font-size: 1rem;
                border-radius: 10px;
                border: none;
                background: white;
              }

              .options-container {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
              }

              .add-option-btn {
                margin-top: 0.5rem;
                align-self: flex-start;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                background: #920f96;
                color: white;
                border: none;
                padding: 0.4rem 0.8rem;
                font-weight: 600;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.2s ease;
              }

              .add-option-btn:hover {
                background: #c14ad0;
              }

              .submit-btn {
                margin-top: 1rem;
                background: #920f96;
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 5px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.2s ease;
              }

              .submit-btn:hover {
                background: #c14ad0;
              }
            `}</style>
        </div>
    );
};

export default AddVotePool;
