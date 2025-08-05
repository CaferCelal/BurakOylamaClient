import React from "react";
import {Route, Routes} from "react-router-dom";
import PublicVotePage from "./pages/public-vote/public-vote.tsx";
import Sign from "./pages/sign/sign.tsx";
import UserVotes from "./pages/user-votes/user-votes.tsx";

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Sign />} />
                <Route path="/sign" element={<Sign/>} />
                <Route path="/user-votes" element={<UserVotes />} />
                <Route path="/vote/:voteId" element={<PublicVotePage />} />

            </Routes>
        </>
    );
};

export default AppRoutes;