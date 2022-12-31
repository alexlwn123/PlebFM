"use client"
// pleb.fm/shiners
// Bidding landing page

import { Customer } from "../../models/Customer";
import { notFound, usePathname } from "next/navigation";
import "../../app/globals.css"
import React, { useEffect } from "react";
import Onboarding from "./Onboarding";
import OnboardingIdentity from "./OnboardingIdentity";
import Search from "./Search";
import { getCustomer } from "../../lib/customers";
import Checkout from "./Checkout";
import LoadingSpinner from "../../components/LoadingSpinner";
// import useSWR from 'swr';

type Props = { params: {
    slug: string
  },
  searchParams: {}
}

export default function Bidding() {
  const pathName = usePathname()?.replaceAll('/', '');
  const [newUser, setNewUser] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState({firstNym: '', lastNym: '', color: ''});
  const [songChoice, setSongChoice] = React.useState('');
  // const { data, error } = useSWR('userProfile', async () => {
  //   const userProfileJSON = localStorage.getItem('userProfile');
  //   if (userProfileJSON) {
  //     return JSON.parse(userProfileJSON);
  //   } else {
  //     throw new Error('not found');
  //   }
  // });
  // if (data) 

  useEffect(() => {
    if (!songChoice) return;
    console.log('SONG', JSON.parse(songChoice));

  }, [songChoice]);

  const generateUser = async () => {
    const result = await fetch('/api/user', {
      method: 'POST',
    })
    const userData = await result.json()
    userData.user.color = userData.user.avatar
    const timer = setTimeout(()=>{
      setUserProfile(userData.user);
      localStorage.setItem('userProfile', JSON.stringify(userData.user));
    }, 1500);
  }

  const setUser = ()=> {
    setNewUser(false)
  }

  const getUserProfileFromLocal = ()=> {
    const userProfileJSON = localStorage.getItem('userProfile')
    if(userProfileJSON) {
      setUserProfile(JSON.parse(userProfileJSON))
      setUser()
    }
    else setNewUser(true)
  }

  useEffect(()=>{
    getUserProfileFromLocal();
  }, []);

  const handleSongChoice = (songChoice: string)=>{
    setSongChoice(songChoice)
  }

  if(!newUser && !userProfile.firstNym) {
    return(<LoadingSpinner />)
  }
  else if(newUser && !userProfile.firstNym) {
    return(<Onboarding generateUserFunc={generateUser} />)
  }
  else if(newUser && userProfile.firstNym) {
    return(<OnboardingIdentity userProfile={userProfile} setNewUserFunc={setUser} />)
  }
  else {
    if(songChoice.length > 0) return(<Checkout song={JSON.parse(songChoice)} parentCallback={setSongChoice} slug={pathName || ""} />)
    else return(<Search setSong={setSongChoice} />)
  }
}
