export interface MissionClientContext {
  customer: string
  role: string
  issueTitle: string
  dialogue: {
    customerLine: string
    technicianLine: string
  }
  missionImage: string
}

export const missionClientContextByLevel: Record<number, MissionClientContext> = {
  1: {
    customer: 'M. Lefevre',
    role: 'Responsable rayon frais',
    issueTitle: 'Le meuble positif ne remonte plus correctement en temperature de consigne.',
    dialogue: {
      customerLine: 'Bonjour, mon meuble ne remonte plus en temperature. Les produits sont trop froids puis trop chauds.',
      technicianLine: 'Je vais verifier le debit d air, les pressions HP/BP et la regulation avant toute action.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?supermarket,refrigeration,display-case',
  },
  2: {
    customer: 'Mme Robert',
    role: 'Cheffe de secteur surgele',
    issueTitle: 'Le meuble negatif a du givre et la temperature derive en service.',
    dialogue: {
      customerLine: 'On a du givre sur le meuble et les surgeles se ramollissent en pointe.',
      technicianLine: 'Je controle le cycle de degivrage, la ventilation et la chaine electrique de commande.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?frozen,food,freezer,supermarket',
  },
  3: {
    customer: 'M. Haddad',
    role: 'Chef magasin',
    issueTitle: 'La chambre froide positive ne tient plus la consigne en fin de journee.',
    dialogue: {
      customerLine: 'En fin de journee la chambre chaude monte et on perd en qualite produit.',
      technicianLine: 'Je vais isoler si le probleme vient du circuit frigo ou de la commande electrique.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?cold-room,warehouse,refrigeration',
  },
  4: {
    customer: 'Mme Nguyen',
    role: 'Responsable qualite',
    issueTitle: 'La chambre negative manque de puissance et ne descend plus assez bas.',
    dialogue: {
      customerLine: 'On ne retrouve plus la temperature cible, surtout quand la porte est sollicitee.',
      technicianLine: 'Je vais relever surchauffe, sous-refroidissement et etat d echange condenseur/evaporateur.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?industrial,freezer,cold-storage',
  },
  5: {
    customer: 'M. Caron',
    role: 'Responsable maintenance',
    issueTitle: 'La centrale positive est instable avec des appels compresseurs anormaux.',
    dialogue: {
      customerLine: 'Les compresseurs cyclent anormalement et les alarmes reviennent chaque matin.',
      technicianLine: 'Je vais analyser la repartition de charge et l etat du condenseur avant correction.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?machine-room,industrial,refrigeration',
  },
  6: {
    customer: 'Mme Diallo',
    role: 'Directrice exploitation',
    issueTitle: 'La centrale negative perd du rendement et la securite produit est menacee.',
    dialogue: {
      customerLine: 'Nous avons des alarmes de temperature sur plusieurs points critiques.',
      technicianLine: 'Je securise d abord la partie electrique puis je lance le diagnostic thermodynamique complet.',
    },
    missionImage: 'https://source.unsplash.com/1600x900/?industrial,compressor,plant',
  },
}

export const fallbackMissionClientContext: MissionClientContext = {
  customer: 'Client magasin',
  role: 'Exploitation',
  issueTitle: 'Anomalie de performance frigorifique signalee sur installation.',
  dialogue: {
    customerLine: 'Le froid n est plus stable sur l installation.',
    technicianLine: 'Je realise le protocole de mesure avant toute reparation.',
  },
  missionImage: '/assets/background/store-aisle.png',
}
