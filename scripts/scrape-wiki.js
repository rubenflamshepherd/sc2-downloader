const cheerio = require('cheerio');

const WIKI_URL = 'https://starcraft.fandom.com/wiki/StarCraft_II_unit_quotations/Protoss';

async function fetchPage(url) {
  const response = await fetch(url);
  return response.text();
}

function parseWikiPage(html) {
  const $ = cheerio.load(html);
  const sections = [];
  let currentSection = null;
  let currentUnit = null;
  let currentCategory = null;

  // Find the main content
  const content = $('#mw-content-text');

  // Category name patterns - look for text before quote lists
  const categoryPatterns = [
    /^Trained/i,
    /^When attacked/i,
    /^Selected/i,
    /^Move order/i,
    /^Attack order/i,
    /^Ordered to attack/i,
    /^Repeatedly selected/i,
    /^Other lines/i,
    /^Confirming/i,
    /^Entering/i,
    /^Exiting/i,
    /^Death/i,
    /^Pissed/i,
    /^Error/i,
    /^Feedback/i,
    /^Hallucination/i,
    /^Warp/i,
    /^Launch/i,
    /^Ready/i,
    /^Morph/i,
    /^Engaging/i,
  ];

  function matchesCategory(text) {
    return categoryPatterns.some(pattern => pattern.test(text.trim()));
  }

  // Process all elements in order
  content.find('h3, h4, h5, p, ul').each((_, element) => {
    const $el = $(element);
    const tagName = element.tagName.toLowerCase();

    // H3 = Main section (Versus Units, Campaign and Co-op Missions Units, Heroes)
    if (tagName === 'h3') {
      const sectionName = $el.find('.mw-headline').text().trim();
      if (sectionName && !sectionName.includes('References') && !sectionName.includes('Navigation') && !sectionName.includes('Contents')) {
        currentSection = {
          name: sectionName,
          units: []
        };
        sections.push(currentSection);
        currentUnit = null;
        currentCategory = null;
      }
    }

    // H4 = Unit name (Zealot, Stalker, etc.)
    if (tagName === 'h4' && currentSection) {
      const unitName = $el.find('.mw-headline').text().trim();
      if (unitName) {
        currentUnit = {
          name: unitName,
          categories: []
        };
        currentSection.units.push(currentUnit);
        currentCategory = null;
      }
    }

    // H5 = Sub-unit or variant (e.g., "High Templar (Wings of Liberty and Versus)")
    if (tagName === 'h5' && currentSection) {
      const subUnitName = $el.find('.mw-headline').text().trim();
      if (subUnitName) {
        currentUnit = {
          name: subUnitName,
          categories: []
        };
        currentSection.units.push(currentUnit);
        currentCategory = null;
      }
    }

    // P = Might contain category name (e.g., "Trained", "When attacked:", "Selected:")
    if (tagName === 'p' && currentUnit) {
      const text = $el.text().trim();
      if (matchesCategory(text)) {
        currentCategory = {
          name: text.replace(/:$/, '').trim(),
          quotes: []
        };
        currentUnit.categories.push(currentCategory);
      }
    }

    // UL = Quote list
    if (tagName === 'ul' && currentUnit) {
      // Check if there's a preceding sibling that indicates category
      const prevP = $el.prev('p');
      if (prevP.length && matchesCategory(prevP.text())) {
        // Category already set from p element above
      } else if (!currentCategory) {
        // Default category
        currentCategory = {
          name: 'Quotes',
          quotes: []
        };
        currentUnit.categories.push(currentCategory);
      }

      // Extract quotes from list items
      $el.children('li').each((_, li) => {
        const $li = $(li);

        // Find audio element
        const $audio = $li.find('audio');
        if ($audio.length) {
          const audioUrl = $audio.attr('src');

          // Get quote text - everything after the audio element
          // Clone and remove the audio-button span to get clean text
          const $clone = $li.clone();
          $clone.find('.audio-button').remove();
          $clone.find('audio').remove();
          let quoteText = $clone.text().trim();

          // Clean up the text
          quoteText = quoteText.replace(/^\s*/, '').trim();

          if (audioUrl && quoteText) {
            if (!currentCategory) {
              currentCategory = {
                name: 'Quotes',
                quotes: []
              };
              currentUnit.categories.push(currentCategory);
            }
            currentCategory.quotes.push({
              text: quoteText,
              audioUrl: audioUrl
            });
          }
        }
      });
    }
  });

  // Clean up empty entries
  for (const section of sections) {
    section.units = section.units.filter(unit => {
      unit.categories = unit.categories.filter(cat => cat.quotes.length > 0);
      return unit.categories.length > 0;
    });
  }

  return sections.filter(s => s.units.length > 0);
}

async function main() {
  console.log('Fetching wiki page...');
  const html = await fetchPage(WIKI_URL);

  console.log('Parsing page structure...');
  const sections = parseWikiPage(html);

  // Count totals
  let totalUnits = 0;
  let totalQuotes = 0;
  for (const section of sections) {
    totalUnits += section.units.length;
    for (const unit of section.units) {
      for (const category of unit.categories) {
        totalQuotes += category.quotes.length;
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Sections: ${sections.length}`);
  console.log(`- Units: ${totalUnits}`);
  console.log(`- Quotes: ${totalQuotes}`);

  // Preview first unit
  if (sections.length > 0 && sections[0].units.length > 0) {
    const firstUnit = sections[0].units[0];
    console.log(`\nPreview (${firstUnit.name}):`);
    if (firstUnit.categories.length > 0) {
      const firstCat = firstUnit.categories[0];
      console.log(`  Category: ${firstCat.name}`);
      if (firstCat.quotes.length > 0) {
        console.log(`  First quote: "${firstCat.quotes[0].text}"`);
        console.log(`  Audio URL: ${firstCat.quotes[0].audioUrl}`);
      }
    }
  }

  // Write output
  const fs = require('fs');
  const path = require('path');
  const output = { sections };
  const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'quotations.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWritten to: ${outputPath}`);
}

main().catch(console.error);
