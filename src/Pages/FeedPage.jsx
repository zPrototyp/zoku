import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { valueProfiles } from '../assets/uiData/zoku_profiles_se';
import { feedListAtom } from '../Atoms/FeedListAtom.jsx';
import { valueProfileAtom } from '../Atoms/ValueProfileAtom.jsx';
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import { testValuesAtom } from '../Atoms/TestValuesAtom.jsx';
import BrandCards from '../Components/BrandCards.jsx';
import "../assets/css/CelebrityDial.css";
import { sortedListAtom } from '../Atoms/SortedListAtom.jsx';
import { brandCategories } from '../assets/uiData/brand_categories_se.js';
import CelebrityCard from '../Components/CelebrityCard.jsx';
import { ZokuMasks } from '../assets/uiData/PersonalityImages.js';
import { API_userSafeFetchJson } from '../Services/API.jsx';
import Search from '../Components/Search.jsx';

const AZURE_API = import.meta.env.VITE_AZURE_API;

export default function FeedPage() {
  {/* x Fetch the list of possible matches from backend = feedList */}
  {/* x Print out drop-down menu to change sorting */}
  {/* x x Print out list of (matching) brands & 1 celebrity profile */}

  const [sortOption, setSortOption] = useState("all"); // Default sort 
  const [feed, setFeed] = useAtom(feedListAtom);
  const [sortedFeed, setSortedFeed] = useAtom(sortedListAtom);
  const userProfile = useAtomValue(valueProfileAtom);
  const token = useAtomValue(authTokenAtom);
  const testValues = useAtomValue(testValuesAtom);
  const [randomCelebrity, setRandomCelebrity] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    if (!token) return;
    const loadRandomCelebrity = async () => {
      try {
        const count = 50;
        const res = await fetch(`${AZURE_API}/user/celebrities/matches?count=${count}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const matches = data?.data || [];
          if (matches.length) {
            const rnd = matches[Math.floor(Math.random() * matches.length)];
            setRandomCelebrity(rnd);
            return;
          }
        } else if (res.status !== 404) {
          const txt = await res.text();
          throw new Error(`Celeb matches failed: ${res.status} ${txt}`);
        }

        const resAll = await fetch(`${AZURE_API}/celebrities`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!resAll.ok) throw new Error(`Celebrities list failed: ${resAll.status}`);

        const dataAll = await resAll.json();
        const allCelebs = dataAll?.data || [];
        if (!allCelebs.length) {
          setRandomCelebrity(null);
          return;
        }
        const rnd = allCelebs[Math.floor(Math.random() * allCelebs.length)];
        setRandomCelebrity(rnd);
      } catch (err) {
        console.error("Error loading random celebrity:", err);
        setRandomCelebrity(null);
      }
    };
    loadRandomCelebrity();
  }, [token, testValues, userProfile]);

  // Re-render the list whenever the feed changes.
  useEffect(() => {
    if (!feed) return;
    sortList(sortOption);  // Resets sorted list when feed changes
  }, [feed]);

  useEffect(() => {
    // Fetch the feed list from the backend, bearer token in header
    const variations = 3;
    setFeed(null);
    try {
      API_userSafeFetchJson(
        token,
        `user/brands/recommendations?Category=all&Variations=${variations}&ExcludeLiked=true&ExcludeHidden=true`,
        (data) => {
          setFeed(data);
          setSortedFeed(data);
        }
      );
    } catch (error) {
      console.error("Error fetching feed list:", error);
    }
  }, [token]);

  const sortList = (option) => {
    setSortOption(option);
    if (!feed) return;
    switch (option) {
      case "all":
        setSortedFeed(feed);
        break;
      default:
        setSortedFeed([...feed].filter((brand) => brand.category == option));
        break;
    }
  };

  return (
     <div className="page-content">
            <div className="feed-page-user-details">
                <h1><img className="mask80" src={ZokuMasks[userProfile?.primaryPersonality.name]} alt={valueProfiles[userProfile?.primaryPersonality.name]?.title} />
                    {valueProfiles[userProfile?.primaryPersonality.name]?.title}
                     {valueProfiles[userProfile?.primaryPersonality.name]?.kanji}
                </h1>
                <h3>{valueProfiles[userProfile?.primaryPersonality.name]?.consumerHeader}</h3>
                <p>{valueProfiles[userProfile?.primaryPersonality.name]?.consumerText}</p>
            </div>
           

      {/* Search */}
      <Search
        token={token}
        brandsFeed={feed || []}
        userProfile={userProfile}
        onActiveChange={setSearchActive}
      />

      {/* Default feed */}
      {!searchActive && (
        <>
          {randomCelebrity && <CelebrityCard celeb={randomCelebrity} user={userProfile} />}

          <div className="feed-sort-options">
            <label htmlFor="sortSelect">Varumärken: </label>
            <select id="sortSelect" value={sortOption} onChange={(e) => sortList(e.target.value)}>
              {Object.entries(brandCategories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {sortedFeed && (
            <div className="feed">
              <BrandCards brandList={sortedFeed} categorize={false}/>
            </div>
          )}
        </>
      )}
    </div>
  );
}