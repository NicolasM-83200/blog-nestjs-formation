import * as fs from 'fs';

const pathFile = 'data.json';
// Read the contents of the JSON file
const file = fs.readFileSync(pathFile, 'utf-8');
// Parse the JSON data into a JavaScript object
const json = JSON.parse(file);

export function readFromJSON() {
  try {
    if (!json) {
      return { message: 'No data found' };
    }
    return json;
  } catch (error) {
    console.error(error);
  }
}

export function writeToJSON(data: any) {
  try {
    console.log('Before Adding data', JSON.stringify(json, null, 2));

    // Modify the JavaScript object by adding new data
    json.users.push(data);

    // Convert the JavaScript object back into a JSON string
    const jsonString = JSON.stringify(json, null, 2);

    // Write the JSON string back to the file
    fs.writeFileSync(pathFile, jsonString, 'utf-8');
  } catch (error) {
    console.error(error);
  }
}

export const deleteFromJSON = (id: string) => {
  try {
    json.users.splice(id, 1);
    fs.writeFileSync(pathFile, JSON.stringify(json, null, 2));
  } catch (error) {
    console.error(error);
  }
};
