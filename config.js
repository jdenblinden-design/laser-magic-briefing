// Liste des vidéos. Pour ajouter une vidéo : mettre le fichier dans /videos et remplacer null par son nom.
// Changer le nom du fichier (ex. _1 -> _2) quand une vidéo est refaite : les iPad la retéléchargent.
window.LM_CONFIG = {
  jungle: {
    name: "Jungle",
    sections: [
      { title: "Anniversaire enfants", sub: "Kinderfeestje · Kids' party", img: "img/gorille.jpg",
        videos: { fr: "videos/jungle_enfants_fr_1.mp4", nl: "videos/jungle_enfants_nl_1.mp4", en: "videos/jungle_enfants_en_1.mp4" } },
      { title: "Adultes · Team building & amis", sub: "Volwassenen · Adults", img: "img/aventuriere.jpg",
        videos: { fr: "videos/jungle_adultes_fr_1.mp4", nl: null, en: null } }
    ]
  },
  prison: {
    name: "Prison",
    sections: [
      { title: "Anniversaire enfants", sub: "Kinderfeestje · Kids' party", img: "img/gardien.jpg",
        videos: { fr: "videos/prison_enfants_fr_1.mp4", nl: null, en: null } },
      { title: "Adultes · Team building & amis", sub: "Volwassenen · Adults", img: "img/soldat.jpg",
        videos: { fr: "videos/prison_adultes_fr_1.mp4", nl: null, en: null } },
      { title: "Dark Mode", sub: "Noir complet · Volledig donker · Pitch black", img: null,
        videos: { fr: null, nl: null, en: null } }
    ]
  }
};
