const fetchData = async () => {
    try {
        const response = await fetch("https://raw.githubusercontent.com/sweko/internet-programming-a98db973kwl8xp1lz94kjf0bma5pez8c/refs/heads/main/data/doctor-who-episodes.json");
        const data = await response.json();
        console.log(data.episodes);
        return data.episodes;
    } catch (error) {
        console.error("Error while fetching data!");
    }
};

const populateFilters = (data) => {
    const eraFilter = document.querySelector("#era-filter");
    const doctorFilter = document.querySelector("#doctor-filter");
    const companionFilter = document.querySelector("#companion-filter");

    const eras = [...new Set(data.map(episode => episode.era))];
    const doctors = [...new Set(data.map(episode => episode.doctor.actor))];
    const companions = [...new Set(data.map(episode => episode.companion 
        && episode.companion.actor).filter(Boolean))
    ];
    
    eras.forEach(era => {
        const option = document.createElement("option");
        option.value = era;
        option.text = era;
        eraFilter.appendChild(option);
    });

    doctors.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor;
        option.text = doctor;
        doctorFilter.appendChild(option);
    });

    companions.forEach(companion => {
        const option = document.createElement("option");
        option.value = companion;
        option.text = companion;
        companionFilter.appendChild(option);
    });
};

const displayListOfEpisodes = (episodes) => {
    const episodesList = document.querySelector("#episodes-container");    
    let htmlString = "";

    episodes.forEach(episode => {
        let eraImage = "";
        switch(episode.era) {
            case "Classic":
                eraImage = "../../images/classic.jpg";
                break;
            case "Modern":
                eraImage = "../../images/modern.jpg";
                break;
            case "Recent":
                eraImage = "../../images/recent.jpg";
                break;
            default:
                eraImage = "../../images/classic.jpg";
                break;
        };


        const episodeRow = `
            <div class="episode-row">
                <div class="episode-cell" data-sort="rank">${episode.rank}</div>
                <div class="episode-cell" data-sort="name">${episode.title}</div>
                <div class="episode-cell" data-sort="series">${episode.series}</div>
                <div class="episode-cell" data-sort="era">
                    <img src="${eraImage}" alt="${episode.era} Era" class="era-image" style="width: 80px;"/>
                </div>
                <div class="episode-cell" data-sort="broadcast">${new Date(episode.broadcast_date).getFullYear()}</div>
                <div class="episode-cell" data-sort="director">${episode.director}</div>
                <div class="episode-cell" data-sort="writer">${episode.writer}</div>
                <div class="episode-cell" data-sort="doctor">${episode.doctor.actor} (${episode.doctor.incarnation})</div>
                <div class="episode-cell" data-sort="companion">
                    ${episode.companion ? `${episode.companion.actor} (${episode.companion.character})` : ''}
                </div>
                <div class="episode-cell" data-sort="cast">
                    ${episode.cast.map(castMember => `${castMember.actor} (${castMember.character})`).join(', ')}
                </div>
                <div class="episode-cell plot-preview">${episode.plot}</div>
            </div>
        `;
        htmlString += episodeRow;
    });
    episodesList.innerHTML = htmlString;
};

const applyFilters = (data) => {
    const nameFilter = document.querySelector("#name-filter").value.toLowerCase();
    const eraFilter = document.querySelector("#era-filter").value;
    const doctorFilter = document.querySelector("#doctor-filter").value;
    const companionFilter = document.querySelector("#companion-filter").value;
    
    const filteredEpisodes = data.filter(episode => {
        const matchesName = episode.title.toLowerCase().includes(nameFilter);
        const matchesEra = !eraFilter || episode.era === eraFilter;
        const matchesDoctor = !doctorFilter || episode.doctor.actor === doctorFilter;
        const matchesCompanion = !companionFilter || (episode.companion && episode.companion.actor === companionFilter);
        return matchesName && matchesEra && matchesDoctor && matchesCompanion;
    });
    
    displayListOfEpisodes(filteredEpisodes);
};

let ascending = true;

const sortEpisodes = (data, key, order) => {
    return data.slice().sort((a, b) => {
        let valueA, valueB;

        if (key === "era") {
            const eraOrder = { "Classic": 1, "Modern": 2, "Recent": 3 };
            valueA = eraOrder[a.era] || 0;
            valueB = eraOrder[b.era] || 0;
        } else if (key === "cast") {
            valueA = a.cast.length;
            valueB = b.cast.length;
        } else if (key === "broadcast") {
            valueA = new Date(a.broadcast_date).getFullYear();
            valueB = new Date(b.broadcast_date).getFullYear();
        } else if (key === "doctor") {
            valueA = a.doctor.actor ? a.doctor.actor.toLowerCase() : "";
            valueB = b.doctor.actor ? b.doctor.actor.toLowerCase() : "";
        } else if (key === "name") {
            valueA = a.title ? a.title.toLowerCase() : "";
            valueB = b.title ? b.title.toLowerCase() : "";
        } else if (key === "companion") {
            valueA = a.companion && a.companion.actor ? a.companion.actor.toLowerCase() : "";
            valueB = b.companion && b.companion.actor ? b.companion.actor.toLowerCase() : "";
        } else {
            valueA = a[key] ? a[key].toString().toLowerCase() : "";
            valueB = b[key] ? b[key].toString().toLowerCase() : "";
        }

        return (valueA > valueB ? 1 : valueA < valueB ? -1 : 0) * (order === "asc" ? 1 : -1);
    });
};

const attachSortHandlers = async () => {
    const data = await fetchData();
    document.querySelectorAll(".header-cell").forEach(header => {
        header.dataset.order = "asc";
        header.addEventListener("click", () => {
            const sortKey = header.dataset.sort;
            const currentOrder = header.dataset.order === "asc" ? "desc" : "asc";
            header.dataset.order = currentOrder;

            const sortedData = sortEpisodes(data, sortKey, currentOrder);
            displayListOfEpisodes(sortedData);
        });
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchData();
    displayListOfEpisodes(data);
    populateFilters(data);
    
    document.querySelector("#name-filter").addEventListener("input", () => applyFilters(data));
    document.querySelector("#era-filter").addEventListener("change", () => applyFilters(data));
    document.querySelector("#doctor-filter").addEventListener("change", () => applyFilters(data));
    document.querySelector("#companion-filter").addEventListener("change", () => applyFilters(data));

    attachSortHandlers();
});
