import React from 'react';
import { Link } from 'wouter';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <Crown className="w-12 h-12 text-primary mb-6" />
      <h1 className="text-6xl font-serif font-bold text-white mb-4">404</h1>
      <p className="text-muted-foreground text-lg mb-8">This page doesn't exist.</p>
      <Link href="/">
        <Button className="bg-primary text-black font-bold">Go Home</Button>
      </Link>
    </div>
  );
}
