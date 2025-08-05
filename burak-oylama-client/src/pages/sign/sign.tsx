import React, { useState } from "react";
import SignServices from "../../services/sign.tsx";
import "./Sign.css";
import { useNavigate } from "react-router-dom";

const Sign: React.FC = () => {
    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        const result = await SignServices.sign(userName, userPassword);
        setLoading(false);

        if (result.success) {
            navigate("/user-votes", { replace: true });
            setUserName("");
            setUserPassword("");
        } else {
            setError(result.error || "Unknown error");
        }
    };

    return (
        <div className="sign">
            <div className="container">
                <label className="label-text">Username</label>
                <input
                    type="text"
                    className="input-box"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={loading}
                />
                <label className="label-text">Password</label>
                <input
                    type="password"
                    className="input-box"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    disabled={loading}
                />
                <button className="action-button" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Processing..." : "Register or Sign in"}
                </button>
                {error && <p className="error-message" style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            </div>
        </div>
    );
};

export default Sign;
