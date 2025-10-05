'use client';

import { signOut } from 'next-auth/react';
import { getLocation } from '../../api/location'

const handleClick = async () => {
    const loc = await getLocation();
    console.log(loc);
}

export default function LocationButton() {
    return (
        <button
            onClick={handleClick}
            style={{
                position: 'absolute',
                top: '20px',
                right: '130px',
                padding: '10px 20px',
                backgroundColor: '#dc2626', // red-600
                color: 'white',
                border: '2px solid black',
                borderRadius: '9999px', // fully rounded
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.2s, transform 0.2s',
            }}
            onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = '#b91c1c') // darker red
            }
            onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = '#dc2626') // red-600
            }
            onMouseDown={(e) =>
                (e.currentTarget.style.transform = 'scale(0.97)') // click feedback
            }
            onMouseUp={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
            }
        >
            Grant Location Permission
        </button>
    );
}
