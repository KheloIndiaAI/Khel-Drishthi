import { Helmet } from "react-helmet-async";

const BASE_URL = "https://kheldrishti.com";

// Breadcrumb item type
export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface PageSEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  jsonLd?: object;
  keywords?: string[];
  breadcrumbs?: BreadcrumbItem[];
}

// Generate BreadcrumbList JSON-LD schema
export const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${BASE_URL}${item.path}`
  }))
});

export const PageSEO = ({ 
  title, 
  description, 
  canonicalPath = "/", 
  jsonLd,
  keywords = [],
  breadcrumbs
}: PageSEOProps) => {
  const fullTitle = title.includes("Khel Drishti") ? title : `${title} | Khel Drishti`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  
  const defaultKeywords = [
    "Khel Drishti",
    "Khelo India",
    "Indian Sports",
    "Sports Analytics"
  ];
  
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])].join(", ");

  // Generate breadcrumb schema if breadcrumbs provided
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;

  // Combine all schemas into an array for multiple JSON-LD blocks
  const schemas = [jsonLd, breadcrumbSchema].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Khel Drishti" />
      <meta property="og:image" content={`${BASE_URL}/favicon.png`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}/favicon.png`} />
      
      {/* JSON-LD Structured Data - inject each schema separately */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

// Pre-defined breadcrumb configurations
export const homeBreadcrumbs: BreadcrumbItem[] = [
  { name: "Home", path: "/" }
];

export const infrastructureBreadcrumbs: BreadcrumbItem[] = [
  { name: "Home", path: "/" },
  { name: "Infrastructure", path: "/infrastructure" }
];

export const medalsBreadcrumbs: BreadcrumbItem[] = [
  { name: "Home", path: "/" },
  { name: "Olympic Medals", path: "/medals" }
];

export const capacityBreadcrumbs: BreadcrumbItem[] = [
  { name: "Home", path: "/" },
  { name: "Capacity Analytics", path: "/capacity" }
];

export const schemaBreadcrumbs: BreadcrumbItem[] = [
  { name: "Home", path: "/" },
  { name: "Schema Documentation", path: "/schema" }
];

export const sportDetailBreadcrumbs = (sportName: string, sportId: string): BreadcrumbItem[] => [
  { name: "Home", path: "/" },
  { name: "Sports", path: "/#sports" },
  { name: sportName, path: `/sport/${sportId}` }
];

// Pre-defined JSON-LD schemas for each page
export const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Khel Drishti",
  "alternateName": "खेल दृष्टि",
  "url": "https://kheldrishti.com",
  "description": "India's comprehensive sports analytics dashboard tracking 50+ sports, 400+ training centers, Olympic medals, and athlete development.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://kheldrishti.com/sport/{search_term}",
    "query-input": "required name=search_term"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Khel Drishti",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kheldrishti.com/favicon.png"
    }
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "LA Olympics 2028 Countdown",
        "description": "Days remaining until Los Angeles Olympics 2028, starting July 14, 2028"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Asian Games 2026 Countdown",
        "description": "Days remaining until Aichi-Nagoya Asian Games 2026, starting September 19, 2026"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Sports Ecosystem",
        "description": "Browse 50+ sports across TOPS, TAGG, and priority schemes"
      }
    ]
  }
};

export const infrastructurePageSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Indian Sports Training Infrastructure",
  "description": "Comprehensive database of 400+ sports training centers across India including NCOE (National Centre of Excellence), STC (State Training Centres), KIC (Khelo India Centres), and KISCE (Khelo India State Centre of Excellence).",
  "url": "https://kheldrishti.com/infrastructure",
  "keywords": [
    "NCOE",
    "STC",
    "KIC",
    "KISCE",
    "Sports Training Centers",
    "Khelo India",
    "Sports Authority of India"
  ],
  "creator": {
    "@type": "Organization",
    "name": "Khel Drishti"
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "India",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 20.5937,
      "longitude": 78.9629
    }
  },
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "Training Center Type",
      "description": "NCOE, STC, KIC, or KISCE classification"
    },
    {
      "@type": "PropertyValue",
      "name": "State",
      "description": "Indian state or union territory where center is located"
    },
    {
      "@type": "PropertyValue",
      "name": "Sports Offered",
      "description": "List of sports disciplines available at the training center"
    },
    {
      "@type": "PropertyValue",
      "name": "Athlete Capacity",
      "description": "Sanctioned and existing athlete count"
    }
  ],
  "includedInDataCatalog": {
    "@type": "DataCatalog",
    "name": "Khel Drishti Sports Data",
    "url": "https://kheldrishti.com"
  }
};

export const medalsPageSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "India Olympic Medal History",
  "description": "Complete record of Olympic and Asian Games medals won by Indian athletes from 1900 to present, including athlete names, sports, events, and medal types.",
  "url": "https://kheldrishti.com/medals",
  "keywords": [
    "Olympic Medals India",
    "Asian Games Medals",
    "Indian Athletes",
    "Gold Medal India",
    "Neeraj Chopra",
    "PV Sindhu",
    "Abhinav Bindra",
    "Hockey India Olympics"
  ],
  "creator": {
    "@type": "Organization",
    "name": "Khel Drishti"
  },
  "temporalCoverage": "1900/2024",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "Medal Type",
      "description": "Gold, Silver, or Bronze medal"
    },
    {
      "@type": "PropertyValue",
      "name": "Sport",
      "description": "Olympic sport discipline"
    },
    {
      "@type": "PropertyValue",
      "name": "Year",
      "description": "Year of the Olympic Games"
    },
    {
      "@type": "PropertyValue",
      "name": "Athlete/Team",
      "description": "Name of medal-winning athlete or team"
    }
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "India's Notable Olympic Achievements",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hockey - 8 Olympic Gold Medals",
        "description": "India won 8 Olympic Gold medals in Hockey between 1928-1980, the most by any nation in Olympic hockey history."
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Neeraj Chopra - Javelin Gold 2020",
        "description": "First Indian to win Olympic Gold in athletics. Historic achievement at Tokyo 2020 Olympics."
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Abhinav Bindra - Shooting Gold 2008",
        "description": "First individual Olympic Gold medal for India at Beijing 2008 in 10m Air Rifle."
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "PV Sindhu - Badminton Medals",
        "description": "First Indian woman to win Olympic Silver (2016) and back-to-back Olympic medals in badminton."
      }
    ]
  }
};

export const capacityPageSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Indian Sports Training Capacity Analytics",
  "description": "Analysis of sanctioned vs existing athlete capacity across NCOE and STC training centers in India. Includes gender distribution, residential status, and state-wise breakdown.",
  "url": "https://kheldrishti.com/capacity",
  "keywords": [
    "Athlete Capacity",
    "NCOE Capacity",
    "STC Capacity",
    "Sports Training",
    "Residential Training",
    "SAI Centers"
  ],
  "creator": {
    "@type": "Organization",
    "name": "Khel Drishti"
  },
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "Sanctioned Capacity",
      "description": "Government-approved number of athlete slots at each training center"
    },
    {
      "@type": "PropertyValue",
      "name": "Existing Athletes",
      "description": "Current number of athletes enrolled and training"
    },
    {
      "@type": "PropertyValue",
      "name": "Utilization Rate",
      "description": "Percentage of sanctioned capacity currently utilized"
    },
    {
      "@type": "PropertyValue",
      "name": "Gender Distribution",
      "description": "Breakdown of athletes by gender (boys/girls)"
    },
    {
      "@type": "PropertyValue",
      "name": "Residential Status",
      "description": "Classification as residential or non-residential training"
    }
  ],
  "spatialCoverage": {
    "@type": "Place",
    "name": "India"
  },
  "measurementTechnique": "Administrative data from Sports Authority of India and Khelo India program records"
};

export const sportDetailPageSchema = (sportName: string, sportId: string) => ({
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": `${sportName} - India`,
  "description": `Comprehensive analytics for ${sportName} in India including training centers, athlete capacity, Olympic events, and medal history.`,
  "url": `https://kheldrishti.com/sport/${sportId}`,
  "sport": sportName,
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "memberOf": {
    "@type": "Organization",
    "name": "Sports Authority of India"
  }
});

export default PageSEO;
