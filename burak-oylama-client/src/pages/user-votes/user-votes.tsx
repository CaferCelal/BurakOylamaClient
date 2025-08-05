import React, { useEffect, useState } from "react";
import VoteServices from "../../services/vote.tsx";
import "./user-votes.css";
import { Copy, LogOut } from "lucide-react";
import AddVotePool from "../../components/add-vote-pool.tsx";
import Sign from "../../services/sign.tsx";
import {useNavigate} from "react-router-dom";


import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface VoteOption {
    id: string;
    name: string;
    users: { voterName: string }[];
}

interface Vote {
    id: string;
    name: string;
    options: VoteOption[];
    lastValidDate: string;
    createdAt: string;
}

const getRandomColor = () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

// Custom Tooltip Component
const CustomTooltip = ({
                           active,
                           payload,
                           selectedVote,
                       }: {
    active?: boolean;
    payload?: any[];
    selectedVote: Vote | undefined;
}) => {
    if (active && payload && payload.length && selectedVote) {
        const optionName = payload[0].name;
        // Find the option details in selectedVote to get usernames
        const option = selectedVote.options.find((opt) => opt.name === optionName);

        return (
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "4px",
                    maxWidth: "250px",
                    color: "#333",
                }}
            >
                <strong>{optionName}</strong>
                <p>{payload[0].value} vote{payload[0].value !== 1 ? "s" : ""}</p>
                {option && option.users.length > 0 ? (
                    <>
                        <p><em>Voters:</em></p>
                        <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                            {option.users.map((user, idx) => (
                                <li key={idx}>{user.voterName}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No voters yet.</p>
                )}
            </div>
        );
    }

    return null;
};

const UserVotes: React.FC = () => {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
    const [showAddVoteModal, setShowAddVoteModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await Sign.logout();
        if (result.success) {
            navigate("/sign");
        } else {
            alert("Logout failed: " + (result.error || "Unknown error"));
        }
    };

    useEffect(() => {
        const fetchVotes = async () => {
            const result = await VoteServices.getUserVotes();
            if (result.error) {
                setError(result.error);
            } else {
                setVotes(result.data);
                if (result.data.length > 0) setSelectedVoteId(result.data[0].id);
            }
        };

        fetchVotes();
    }, []);

    const selectedVote = votes.find((v) => v.id === selectedVoteId);

    // Calculate total votes to check for 100% winner
    const totalVotes = selectedVote
        ? selectedVote.options.reduce((sum, opt) => sum + opt.users.length, 0)
        : 0;

    // Prepare pie data normally
    const pieData =
        selectedVote?.options.map((opt) => ({
            name: opt.name,
            value: opt.users.length,
        })) || [];

    // Check if there is a 100% winner (one option has all votes)
    const winnerIndex = pieData.findIndex((opt) => opt.value === totalVotes && totalVotes > 0);
    const isHundredPercentWinner = winnerIndex !== -1;

    // Colors array helper
    const COLORS = pieData.map(() => getRandomColor());

    return (
        <div className="user-votes">
            {showAddVoteModal && (
                <AddVotePool
                    onClose={() => setShowAddVoteModal(false)}
                    onSubmit={(voteName, endDate, options) => {
                        // Here you can handle new vote creation, e.g. call your VoteServices API
                        console.log("New Vote Data:", { voteName, endDate, options });

                        // Example: you might want to reload votes after adding or just update state:
                        // fetchVotes(); // or append new vote to votes state

                        setShowAddVoteModal(false);
                    }}
                />
            )}

            <LogOut
                size={24}
                className="logout-icon"
                onClick={handleLogout}
                title="Log out"
            />
            <div className="left-bar">
                <h2>Your Vote Polls</h2>

                <div className="vote-list">
                    {error && <p>{error}</p>}
                    {!error && votes.length === 0 && <p>Loading...</p>}
                    {votes.map((vote) => (
                        <div
                            key={vote.id}
                            className="vote-name"
                            style={{
                                backgroundColor: vote.id === selectedVoteId ? "#c14ad0" : "#e85dec",
                            }}
                            onClick={() => setSelectedVoteId(vote.id)}
                        >
                            {vote.name}
                        </div>
                    ))}
                </div>


                <button className="bottom-button" onClick={() => setShowAddVoteModal(true)}>
                    Add vote
                </button>

            </div>

            <div className="right-container">
                <div className="right-bar">
                    {selectedVote ? (
                        <>
                            <h2 className="title-with-copy">
                                {selectedVote.name}
                                <Copy
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        if (selectedVote) {
                                            const url = `${window.location.origin}/vote/${selectedVote.id}`;
                                            navigator.clipboard.writeText(url);
                                            alert(`Address copied to clipboard:\n${url}`);
                                        }
                                    }}
                                    title="Copy vote link"
                                />
                            </h2>


                            {totalVotes === 0 ? (
                                <p>No votes cast yet.</p>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    isHundredPercentWinner
                                                        ? [pieData[winnerIndex]] // only show winner slice
                                                        : pieData
                                                }
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                label={(entry) =>
                                                    `${entry.name}: ${entry.value} vote${entry.value !== 1 ? "s" : ""}`
                                                }
                                            >
                                                {(isHundredPercentWinner
                                                        ? [pieData[winnerIndex]]
                                                        : pieData
                                                ).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[isHundredPercentWinner ? winnerIndex : index]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip selectedVote={selectedVote} />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {isHundredPercentWinner && (
                                        <div style={{ marginTop: "10px" }}>
                                            <ul>
                                                {selectedVote.options
                                                    .filter((_, i) => i !== winnerIndex)
                                                    .map((opt) => (
                                                        <li key={opt.id}>
                                                            {opt.name} — 0 votes
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <p>Select a vote from the left to view details</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default UserVotes;
