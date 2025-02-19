import axios from "axios";
import * as cheerio from "cheerio";
import baseUrl from "../utils/baseUrl.js";

export async function extractCharacter(id) {
  try {
    const response = await axios.get(`${baseUrl}/character/${id}`);
    const $ = cheerio.load(response.data);

    // Extract basic information
    const name = $(".apw-detail .name").text().trim();
    const japaneseName = $(".apw-detail .sub-name").text().trim();
    
    // Extract about information
    const bioText = $("#bio .bio").text().trim();
    const bioHtml = $("#bio .bio").html();
    const about = {
      description: bioText,
      style: bioHtml
    };

    // Extract voice actors
    const voiceActors = [];
    $("#voiactor .per-info").each((_, element) => {
      const voiceActorElement = $(element);
      
      const voiceActor = {
        name: voiceActorElement.find(".pi-name a").text().trim(),
        profile: voiceActorElement.find(".pi-avatar img").attr("src"),
        language: voiceActorElement.find(".pi-cast").text().trim(),
        id: voiceActorElement.find(".pi-name a").attr("href")?.split("/").pop()
      };
      
      if (voiceActor.name && voiceActor.id) {
        voiceActors.push(voiceActor);
      }
    });

    // Extract animeography
    const animeography = [];
    console.log("Extracting animeography...");
    $(".anif-block-ul li").each((_, el) => {
      const item = $(el);
      const title = item.find(".film-name a").text().trim();
      const id = item.find(".film-name a").attr("href")?.split("-").pop();
      const role = item.find(".fdi-item").first().text().trim();
      const type = item.find(".fdi-item").last().text().trim();
      const poster = item.find(".film-poster img").attr("src");
      
      if (title && id) {
        animeography.push({
          title,
          id,
          role: role.replace(" (Role)", ""), // Remove "(Role)" suffix if present
          type,
          poster
        });
      }
    });

    console.log(`Found ${animeography.length} animeography items`);

    // Construct the final response
    const characterData = {
      characters: [{
        id,
        name,
        japaneseName,
        about,
        voiceActors,
        animeography
      }]
    };

    return characterData;

  } catch (error) {
    console.error("Error extracting character data:", error);
    throw new Error("Failed to extract character information");
  }
}

export default extractCharacter; 