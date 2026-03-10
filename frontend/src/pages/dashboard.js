import React from "react";
import { Link } from "react-router-dom";
import BookList from "./booklist";
import "../App.css";
import "../components/ui/ui.css";
import Navbar from "../components/navbar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

export default function Dashboard({ user, onLogout }) {
  const firstName = localStorage.getItem("first_name") || "";
  const lastName = localStorage.getItem("last_name") || "";
  const displayName = `${firstName} ${lastName}`.trim() || user || "";

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <main className="dashboard-shell">
        <div className="dashboard-layout">
          <Card className="dashboard-hero-card">
            <CardHeader>
              <CardTitle>Welcome back{displayName ? `, ${displayName}` : ""}</CardTitle>
              <CardDescription>
                Manage your listings and jump into the sections you use most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="dashboard-actions">
                <Link to="/mybook">
                  <Button>Add or Manage Books</Button>
                </Link>
                <Link to="/board">
                  <Button variant="ghost">Open Boards</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="dashboard-stats-grid">
            <Card>
              <CardHeader>
                <CardTitle>Quick Action</CardTitle>
                <CardDescription>Create and publish a listing in under a minute.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/mybook">
                  <Button size="sm">Create Listing</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>My Inventory</CardTitle>
                <CardDescription>Review books you own and update statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/mybook">
                  <Button size="sm" variant="secondary">Manage Books</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Community</CardTitle>
                <CardDescription>Join discussion boards and connect with readers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/board">
                  <Button size="sm" variant="ghost">Go to Boards</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="dashboard-list-card">
            <CardHeader>
              <CardTitle>Book Marketplace</CardTitle>
              <CardDescription>
                Browse available books and explore recent listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookList embedded />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
