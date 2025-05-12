"use client"

import React from 'react'
import {Button} from '@/components/ui/button'


const LinkAccountButton = () => {
    const handleClick = async () => {
      const res = await fetch("/api/aurinko/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType: "Google" }),
      });
  
      if (!res.ok) {
        alert("Failed to get auth URL");
        return;
      }
  
      const data = await res.json();
      window.location.href = data.url;
    };
  
    return <Button onClick={handleClick}>Link Account</Button>;
  };

export default LinkAccountButton







