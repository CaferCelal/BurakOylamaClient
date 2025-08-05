import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./public-vote.css";
import VoteServices from "../../services/vote.tsx";

type VoteOption = {
    name: string;
    id: string;
    votesCount: number;
};

type VoteData = {
    voteName: string;
    userName: string;
    createdAt: string;
    lastValidDate: string;
    options: VoteOption[];
};

const PublicVotePage: React.FC = () => {
    const { voteId } = useParams<{ voteId: string }>();
    const [voteData, setVoteData] = useState<VoteData[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState(false);
    const [remainingTime, setRemainingTime] = useState<string>("");
    const [colorMap, setColorMap] = useState<Record<string, string>>({});

    const getRandomColor = () => {
        return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    };

    const formatTimeRemaining = (milliseconds: number) => {
        if (milliseconds <= 0) return "Expired";

        const totalSeconds = Math.floor(milliseconds / 1000);
        const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60)); // ~30 days/month
        const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let parts: string[] = [];
        if (months > 0) parts.push(`${months}mo`);
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds >= 0) parts.push(`${seconds}s`);

        return parts.join(" ");
    };

    useEffect(() => {
        if (!voteId) {
            setError("No vote ID provided.");
            setLoading(false);
            return;
        }

        const fetchVote = async () => {
            setLoading(true);
            const result = await VoteServices.getPublicVote(voteId);

            if (result.error) {
                setError(result.error);
                setVoteData(null);
            } else if (result.data) {
                setVoteData(result.data);
                setError(null);

                // Set initial color map
                const map: Record<string, string> = {};
                result.data.forEach((vote) => {
                    vote.options.forEach((option) => {
                        map[option.id] = getRandomColor();
                    });
                });
                setColorMap(map);
            }

            setLoading(false);
        };

        fetchVote();
    }, [voteId]);

    useEffect(() => {
        if (!voteData || voteData.length === 0) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const validUntil = new Date(voteData[0].lastValidDate).getTime();
            const timeLeft = validUntil - now;

            setRemainingTime(formatTimeRemaining(timeLeft));
        }, 1000);

        return () => clearInterval(interval);
    }, [voteData]);

    const handleVoteClick = async (optionId: string) => {
        if (!voteData || !voteId) return;

        // Use your username input or default to anonymous
        const userName = prompt("Please enter your name:")?.trim() || "Anonymous";

        // Call backend voting service
        const result = await VoteServices.voteForOption(voteId, optionId, userName);

        if (result.success) {
            // Update UI only on success:
            const newVoteData = voteData.map((vote) => ({
                ...vote,
                options: vote.options.map((option) =>
                    option.id === optionId
                        ? { ...option, votesCount: option.votesCount + 1 }
                        : option
                ),
            }));

            setVoteData(newVoteData);
            setShowDetails(true);
            setError(null);
        } else {
            alert("Failed to submit vote: " + result.error);
        }
    };


    if (loading) {
        return <div>Loading vote data...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>Error: {error}</div>;
    }

    if (!voteData || voteData.length === 0) {
        return <div>No vote data found.</div>;
    }

    return (
        <div className="public-vote-container">
            {voteData.map((vote, idx) => (
                <div
                    key={idx}
                    style={{
                        display: "flex",
                        width: "80vw",
                        justifyContent: "center",
                        gap: "2rem",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                    <div className="left" style={{ color: "white", paddingRight: "2rem", boxSizing: "border-box" }}>
                        <h1>{vote.voteName}</h1>
                        <p>
                            <strong>Created by:</strong> {vote.userName}
                        </p>
                        <p>
                            <strong>Created at:</strong> {new Date(vote.createdAt).toLocaleString()}
                        </p>
                        <p>
                            <strong>Valid until:</strong> {remainingTime}
                        </p>

                        {!showDetails ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyItems: "center",
                                    padding: "2rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                {vote.options.map((option) => (
                                    <button
                                        key={option.id}
                                        style={{
                                            margin: "1rem",
                                            padding: "0.5rem 1rem",
                                            cursor: "pointer",
                                            backgroundColor: "#e85dec",
                                            whiteSpace: "nowrap",
                                        }}
                                        onClick={() => handleVoteClick(option.id)}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                <h3>Options:</h3>
                                <ul>
                                    {vote.options.map((option) => (
                                        <li key={option.id}>
                                            {option.name} — Votes: {option.votesCount}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {showDetails && (
                        <div className="right">
                            <h4 style={{ color: "white" }}>Vote Distribution</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={vote.options}
                                        dataKey="votesCount"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {vote.options.map((option) => (
                                            <Cell key={option.id} fill={colorMap[option.id] || "#cccccc"} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PublicVotePage;
