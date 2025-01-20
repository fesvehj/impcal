const fs = require("fs");
const csv = require("csv-parser");
const { Client } = require("@notionhq/client")
const notion = new Client({auth: [your_notion_api_key],});
const DATABASE_ID = [database_id]

function createNotionPage(rowValues) {
    let cat;
    let endT;

    if (rowValues.includes('Lecture', 4) || rowValues[4] === 'Laboratory session' || rowValues[4] === 'Lesson' || rowValues[4] === 'Seminar') {
        cat = 'Lectures';
    } else if (rowValues.includes('examination', 4)) {
        cat = 'Other';
    } else if (rowValues[4] === 'Hand-in' || rowValues[4] === 'Presentation' || rowValues[4] === 'Assignment handout') {
        cat = 'Deadlines';
    } else {
        cat = 'Other';
    }

    if (rowValues[3] === '00:00') {
        endT = '23:59';
    } else {endT = rowValues[3]}
    const end_time = endT;
    const category = cat;

    try {
        const response = notion.pages.create({
            "parent": {
                "type": "database_id",
                "database_id": DATABASE_ID
            },
            "properties": {
                "Name": {
                    "type": "title",
                    "title": [
                        {
                            "type": "text",
                            "text":
                                {
                                    "content": rowValues[5],
                                },
                        }
                    ]
                },
                "Category": {
                    "select": {
                        "name": category,
                    },
                },
                "Date": {
                    "date": {
                        "start": (rowValues[0] + "T" + rowValues[1]),
                        "end": (rowValues[2] + "T" + end_time),
                        "time_zone": "Europe/Stockholm",
                    }
                },
                "": {
                    "checkbox": false
                }
            },
            "children": [
                {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": (rowValues[6] + "\n" + rowValues[7] + "\n" + rowValues[8]),
                                }
                            }
                        ]
                    }
                }
            ]
        });
        console.log(response);
    } catch (error){
        console.log(error);
    }
}
const csvPath = 'path\\file.csv'

function processRows(csvPath){
    fs.createReadStream(csvPath)
        .pipe(csv({separator: ';'}))
        .on('data', (row) => {
            const rowValues = Object.values(row);
            console.log(rowValues)
            createNotionPage(rowValues);
        })
        .on('end', () => {
            console.log('Complete');
        });
}

processRows(csvPath);