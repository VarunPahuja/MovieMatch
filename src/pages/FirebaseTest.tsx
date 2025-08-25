import React, { useState, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { ref, set, onValue } from 'firebase/database';
import app, { database } from '@/config/firebase';

const BUTTONS = [1, 2, 3, 4];

export default function FirebaseTest() {
  const [room, setRoom] = useState('test-room');
  const [userId, setUserId] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: number[] }>({});
  const [common, setCommon] = useState<number[]>([]);

  useEffect(() => {
    // Generate a unique user ID for this session
    let id = localStorage.getItem('firebaseTestUserId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('firebaseTestUserId', id);
    }
    setUserId(id);
  }, []);

  useEffect(() => {
    // Listen for likes in the room
  const likesRef = ref(database, `firebaseTestRooms/${room}/likes`);
    return onValue(likesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLikes(data);
      // Find common likes
      const buttonCounts: { [key: string]: number } = {};
      Object.values(data).forEach((userLikes) => {
        (userLikes ? (userLikes as number[]) : []).forEach((btn: number) => {
          buttonCounts[btn] = (buttonCounts[btn] || 0) + 1;
        });
      });
      const commonButtons = Object.entries(buttonCounts)
        .filter(([_, count]) => count > 1)
        .map(([btn]) => Number(btn));
      setCommon(commonButtons);
    });
  }, [room]);

  const handleLike = async (btn: number) => {
    const userLikes = likes[userId] || [];
    if (!userLikes.includes(btn)) {
      const newLikes = [...userLikes, btn];
      await set(ref(database, `firebaseTestRooms/${room}/likes/${userId}`), newLikes);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Room: {room}</h1>
      <div className="flex gap-4 mb-6">
        {BUTTONS.map((btn) => (
          <button
            key={btn}
            onClick={() => handleLike(btn)}
            className={`px-6 py-3 rounded text-white font-bold text-xl ${common.includes(btn) ? 'bg-green-600' : 'bg-blue-600'} transition`}
          >
            {btn}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Common Liked Buttons:</h2>
        <div className="flex gap-4">
          {common.length === 0 && <span className="text-gray-500">None</span>}
          {common.map((btn) => (
            <span key={btn} className="bg-green-200 text-green-800 px-4 py-2 rounded-full font-bold text-lg">
              {btn}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
