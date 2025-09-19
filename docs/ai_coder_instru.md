import pandas as pd
import re
import requests
import json
import os
from datetime import datetime
import openpyxl
from openpyxl.utils import get_column_letter

# Configuration settings - similar to the JavaScript CONFIG object
CONFIG = {
    "GEMINI_API_KEY": "",  # Add your API key
    "GEMINI_MODEL_STRUCTURE": "gemini-2.0-flash",
    "GEMINI_MODEL_MARKET_VALUE": "gemini-2.0-flash"
}

def log_message(message, is_error=False):
    """Log messages to a log file or console"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_prefix = "ERROR: " if is_error else "INFO: "
    print(f"{timestamp} - {log_prefix}{message}")

def extract_initial_rows(worksheet, num_rows=15):
    """Extract the first N rows from worksheet for analysis"""
    initial_rows = []
    for i in range(1, num_rows + 1):
        row_data = []
        for j in range(1, 20):  # Assuming max 20 columns in the data
            cell_value = worksheet.cell(row=i, column=j).value
            row_data.append(cell_value if cell_value is not None else '')
        initial_rows.append(row_data)
    return initial_rows

def analyze_with_gemini(initial_rows):
    """Analyze the Excel structure using Gemini API"""
    log_message(f"Analyzing file structure with Gemini {CONFIG['GEMINI_MODEL_STRUCTURE']}...")
    
    # Convert rows to text for the API
    rows_text = "\n".join([", ".join([str(cell) for cell in row]) for row in initial_rows])
    
    prompt = f"""
    Analyze these first {len(initial_rows)} rows from a mutual fund portfolio Excel sheet:
    
    {rows_text}
    
    Identify the following information:
    1. The row number where the data starts (after headers)
    2. The column letters for ISIN codes
    3. The column letters for Instrument/Security Name
    4. The column letters for Market Value
    5. The column letters for Quantity/Volume
    """
    
    try:
        # Prepare the request payload for Gemini API
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "dataStartRow": {"type": "INTEGER"},
                        "columns": {
                            "type": "OBJECT",
                            "properties": {
                                "isin": {"type": "STRING"},
                                "instrumentName": {"type": "STRING"},
                                "marketValue": {"type": "STRING"},
                                "quantity": {"type": "STRING"}
                            }
                        }
                    }
                }
            }
        }
        
        # Make API request to Gemini
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{CONFIG['GEMINI_MODEL_STRUCTURE']}:generateContent?key={CONFIG['GEMINI_API_KEY']}",
            headers={"Content-Type": "application/json"},
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            # Extract the JSON content from Gemini response
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                    json_response = candidate['content']['parts'][0].get('text', '{}')
                    schema_json = json.loads(json_response)
                    return schema_json
            log_message("Failed to parse Gemini response", True)
            return None
        else:
            log_message(f"API request failed with status code: {response.status_code}", True)
            log_message(f"Error message: {response.text}", True)
            return None
    except Exception as e:
        log_message(f"Error analyzing structure: {str(e)}", True)
        return None

def get_gemini_market_value(initial_rows):
    """Get the total market value from Gemini API"""
    log_message(f"Getting market value with Gemini {CONFIG['GEMINI_MODEL_MARKET_VALUE']}...")
    
    rows_text = "\n".join([", ".join([str(cell) for cell in row]) for row in initial_rows])
    
    prompt = f"""
    Analyze these first {len(initial_rows)} rows from a mutual fund portfolio Excel sheet:
    
    {rows_text}
    
    Find the Total NAV or Total Market Value of the portfolio from the sheet.
    This is usually labeled as 'Total', 'Total NAV', 'Total Market Value', etc.
    Return ONLY the numerical value with no text or formatting.
    """
    
    try:
        # Prepare the request payload for Gemini API
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "total_market_value": {"type": "NUMBER"}
                    }
                }
            }
        }
        
        # Make API request to Gemini
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{CONFIG['GEMINI_MODEL_MARKET_VALUE']}:generateContent?key={CONFIG['GEMINI_API_KEY']}",
            headers={"Content-Type": "application/json"},
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            # Extract the JSON content from Gemini response
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                    json_response = candidate['content']['parts'][0].get('text', '{"total_market_value": 0}')
                    value_json = json.loads(json_response)
                    if 'total_market_value' in value_json:
                        return float(value_json['total_market_value'])
            
            # If structured response fails, try to extract from raw text
            try:
                raw_text = candidate['content']['parts'][0].get('text', '0')
                value_match = re.search(r'[\d,]+\.?\d*', raw_text)
                if value_match:
                    return float(value_match.group().replace(',', ''))
            except:
                pass
            
            return 0
        else:
            log_message(f"API request failed with status code: {response.status_code}", True)
            return 0
    except Exception as e:
        log_message(f"Error getting market value: {str(e)}", True)
        return 0

def load_isin_mapping(mapping_path="ISIN_SYMBOL_MAPPING.csv"):
    """Load ISIN mapping file"""
    isin_map = {}
    try:
        if os.path.exists(mapping_path):
            df = pd.read_csv(mapping_path)
            for _, row in df.iterrows():
                isin_map[row[1].strip()] = {
                    "std_company_name": row[0].strip(),
                    "bse_symbol": row[2].strip(),
                    "nse_symbol": row[3].strip()
                }
            log_message(f"Loaded {len(isin_map)} ISIN mappings")
        else:
            log_message(f"Warning: ISIN mapping file not found: {mapping_path}", True)
    except Exception as e:
        log_message(f"Warning: Error reading ISIN mapping file: {str(e)}", True)
    
    return isin_map

def process_portfolio_data(workbook, input_sheet_name, scheme_name, month_end_date, delimiter="|"):
    """
    Process the mutual fund portfolio data
    
    Parameters:
    - workbook: Excel workbook object
    - input_sheet_name: Name of the input sheet
    - scheme_name: Name of the mutual fund scheme
    - month_end_date: Month end date in YYYY-MM-DD format
    - delimiter: Delimiter for the output data
    
    Returns:
    - Processed data and statistics
    """
    log_message(f"Processing sheet: {input_sheet_name}")
    
    try:
        # Access the worksheet
        worksheet = workbook[input_sheet_name]
        
        # Extract initial rows for analysis
        initial_rows = extract_initial_rows(worksheet)
        
        # Analyze structure with Gemini
        analysis = analyze_with_gemini(initial_rows)
        if not analysis:
            log_message("Failed to analyze sheet structure", True)
            return None
        
        log_message(f"Analysis result: {json.dumps(analysis)}")
        
        # Get Gemini total market value
        gemini_total_value = get_gemini_market_value(initial_rows)
        log_message(f"Gemini Total Market Value: {gemini_total_value:,.2f}")
        
        # Load ISIN mapping
        isin_map = load_isin_mapping()
        
        # Convert column letters to indices (A=1, B=2, etc.)
        col_indices = {
            'isin': ord(analysis['columns']['isin']) - 64,
            'instrumentName': ord(analysis['columns']['instrumentName']) - 64,
            'marketValue': ord(analysis['columns']['marketValue']) - 64,
            'quantity': ord(analysis['columns']['quantity']) - 64
        }
        
        # Create output data structure
        headers = ["SCHEME_NAME", "MONTH_END", "ISIN", "INSTRUMENT_NAME", "MARKET_VALUE", 
                  "QUANTITY", "BSE_SYMBOL", "NSE_SYMBOL", "COMPANY_NAME_STD"]
        output_data = [headers]
        
        # Process data rows
        total_market_value = 0
        total_quantity = 0
        valid_record_count = 0
        
        # Start from dataStartRow
        start_row = analysis['dataStartRow']
        
        for row_idx in range(start_row, worksheet.max_row + 1):
            isin = worksheet.cell(row=row_idx, column=col_indices['isin']).value
            
            if isin and isinstance(isin, str) and isin.startswith('IN'):
                valid_record_count += 1
                
                # Get values from the row
                instrument_name = worksheet.cell(row=row_idx, column=col_indices['instrumentName']).value or ""
                market_value = worksheet.cell(row=row_idx, column=col_indices['marketValue']).value or 0
                quantity = worksheet.cell(row=row_idx, column=col_indices['quantity']).value or 0
                
                # Get mapping data
                mapped_data = isin_map.get(isin, {
                    'std_company_name': '',
                    'bse_symbol': '',
                    'nse_symbol': ''
                })
                
                # Create output row
                output_row = [
                    scheme_name,
                    month_end_date,
                    isin,
                    instrument_name,
                    market_value,
                    quantity,
                    mapped_data.get('bse_symbol', ''),
                    mapped_data.get('nse_symbol', ''),
                    mapped_data.get('std_company_name', '')
                ]
                output_data.append(output_row)
                
                # Update totals
                # Handle different types of market value and quantity data
                if isinstance(market_value, str):
                    try:
                        market_value_num = float(re.sub(r'[^\d.-]', '', market_value))
                    except:
                        market_value_num = 0
                else:
                    market_value_num = float(market_value) if market_value else 0
                
                if isinstance(quantity, str):
                    try:
                        quantity_num = float(re.sub(r'[^\d.-]', '', quantity))
                    except:
                        quantity_num = 0
                else:
                    quantity_num = float(quantity) if quantity else 0
                
                total_market_value += market_value_num
                total_quantity += quantity_num
        
        # Calculate difference between Gemini total and processed total
        difference = gemini_total_value - total_market_value
        
        # Add balancing row for cash/derivatives
        if difference != 0:
            balancing_row = [
                scheme_name,
                month_end_date,
                'IN9999999999',
                'ZZZ! Cash / Derivatives / Balancing Num',
                difference,
                '',
                '',
                '',
                ''
            ]
            output_data.append(balancing_row)
        
        # Create statistics
        stats = {
            'total_market_value': total_market_value,
            'gemini_market_value': gemini_total_value,
            'record_count': valid_record_count,
            'total_quantity': total_quantity,
            'difference_amount': difference,
            'schema': f"{analysis['dataStartRow']}-{analysis['columns']['isin']}-{analysis['columns']['instrumentName']}-{analysis['columns']['marketValue']}-{analysis['columns']['quantity']}"
        }
        
        log_message(f"Processed {valid_record_count} records")
        log_message(f"Total Market Value: {total_market_value:,.2f}")
        log_message(f"Total Quantity: {total_quantity:,.2f}")
        log_message(f"Difference Amount: {difference:,.2f}")
        
        return {
            'output_data': output_data,
            'stats': stats
        }
        
    except Exception as e:
        log_message(f"Error processing portfolio data: {str(e)}", True)
        import traceback
        log_message(traceback.format_exc(), True)
        return None

def create_output_sheet(workbook, input_sheet_name, processed_data):
    """Create a new sheet with the processed data"""
    # Create output sheet name
    output_sheet_name = f"{input_sheet_name}_cleaned"
    
    # Check if sheet already exists
    if output_sheet_name in workbook.sheetnames:
        # If exists, delete the existing sheet
        workbook.remove(workbook[output_sheet_name])
    
    # Create new sheet
    output_sheet = workbook.create_sheet(output_sheet_name)
    
    # Write the processed data
    for row_idx, row_data in enumerate(processed_data['output_data'], 1):
        for col_idx, cell_value in enumerate(row_data, 1):
            output_sheet.cell(row=row_idx, column=col_idx, value=cell_value)
    
    # Add statistics section
    stats = processed_data['stats']
    stats_start_row = len(processed_data['output_data']) + 3
    
    output_sheet.cell(row=stats_start_row, column=1, value="Statistics")
    output_sheet.cell(row=stats_start_row + 1, column=1, value="Total Market Value")
    output_sheet.cell(row=stats_start_row + 1, column=2, value=stats['total_market_value'])
    
    output_sheet.cell(row=stats_start_row + 2, column=1, value="Gemini Market Value")
    output_sheet.cell(row=stats_start_row + 2, column=2, value=stats['gemini_market_value'])
    
    output_sheet.cell(row=stats_start_row + 3, column=1, value="Record Count")
    output_sheet.cell(row=stats_start_row + 3, column=2, value=stats['record_count'])
    
    output_sheet.cell(row=stats_start_row + 4, column=1, value="Total Quantity")
    output_sheet.cell(row=stats_start_row + 4, column=2, value=stats['total_quantity'])
    
    output_sheet.cell(row=stats_start_row + 5, column=1, value="Difference Amount")
    output_sheet.cell(row=stats_start_row + 5, column=2, value=stats['difference_amount'])
    
    output_sheet.cell(row=stats_start_row + 6, column=1, value="Schema")
    output_sheet.cell(row=stats_start_row + 6, column=2, value=stats['schema'])
    
    # Format the sheet
    for col in range(1, len(processed_data['output_data'][0]) + 1):
        output_sheet.column_dimensions[get_column_letter(col)].width = 15
    
    # Return stats to update in master sheet if needed
    return stats

def process_portfolio_from_master(workbook, master_sheet_name="Master", input_cell_references=None):
    """
    Process portfolio data based on information from a master sheet
    
    Parameters:
    - workbook: Excel workbook
    - master_sheet_name: Name of the master sheet where input parameters are stored
    - input_cell_references: Dictionary with cell references for input parameters
        {
            'sheet_name': 'B2',  # Cell where input sheet name is stored
            'scheme_name': 'B3',  # Cell where scheme name is stored
            'month_end': 'B4',    # Cell where month end date is stored
            'gemini_api_key': 'B5', # Cell where Gemini API key is stored
            'gemini_model_structure': 'B6', # Cell where Gemini model for structure analysis is stored
            'gemini_model_market_value': 'B7' # Cell where Gemini model for market value analysis is stored
        }
    
    Returns:
    - Dictionary with processing results
    """
    if input_cell_references is None:
        input_cell_references = {
            'sheet_name': 'B2',
            'scheme_name': 'B3',
            'month_end': 'B4',
            'gemini_api_key': 'B5',
            'gemini_model_structure': 'B6',
            'gemini_model_market_value': 'B7'
        }
    
    try:
        # Get master sheet
        master_sheet = workbook[master_sheet_name]
        
        # Get input parameters from master sheet
        input_sheet_name = master_sheet[input_cell_references['sheet_name']].value
        scheme_name = master_sheet[input_cell_references['scheme_name']].value
        month_end_date = master_sheet[input_cell_references['month_end']].value
        
        # Get Gemini API key and model names from master sheet (if provided)
        gemini_api_key = master_sheet[input_cell_references['gemini_api_key']].value
        gemini_model_structure = master_sheet[input_cell_references['gemini_model_structure']].value
        gemini_model_market_value = master_sheet[input_cell_references['gemini_model_market_value']].value
        
        if gemini_api_key:
            CONFIG['GEMINI_API_KEY'] = gemini_api_key
            log_message("Using Gemini API key from Master sheet")
        
        if gemini_model_structure:
            CONFIG['GEMINI_MODEL_STRUCTURE'] = gemini_model_structure
            log_message(f"Using Gemini structure model from Master sheet: {gemini_model_structure}")
        
        if gemini_model_market_value:
            CONFIG['GEMINI_MODEL_MARKET_VALUE'] = gemini_model_market_value
            log_message(f"Using Gemini market value model from Master sheet: {gemini_model_market_value}")
        
        # Format date if it's a datetime object
        if isinstance(month_end_date, datetime):
            month_end_date = month_end_date.strftime("%Y-%m-%d")
        
        # Validate input parameters
        if not input_sheet_name or not scheme_name or not month_end_date:
            log_message("Missing input parameters in master sheet", True)
            return {
                'success': False,
                'message': "Missing input parameters in master sheet"
            }
        
        # Validate API key
        if not CONFIG['GEMINI_API_KEY']:
            log_message("Missing Gemini API key in configuration or Master sheet", True)
            return {
                'success': False,
                'message': "Missing Gemini API key in configuration or Master sheet"
            }
        
        log_message(f"Processing with parameters: Sheet={input_sheet_name}, Scheme={scheme_name}, Date={month_end_date}")
        
        # Check if the input sheet exists
        if input_sheet_name not in workbook.sheetnames:
            log_message(f"Input sheet '{input_sheet_name}' not found in workbook", True)
            return {
                'success': False,
                'message': f"Input sheet '{input_sheet_name}' not found in workbook"
            }
        
        # Process the data
        processed_data = process_portfolio_data(workbook, input_sheet_name, scheme_name, month_end_date)
        
        if not processed_data:
            return {
                'success': False,
                'message': "Failed to process portfolio data"
            }
        
        # Create output sheet with the processed data
        stats = create_output_sheet(workbook, input_sheet_name, processed_data)
        
        # Update master sheet with results if needed
        # For example:
        master_sheet['D2'] = processed_data['stats']['total_market_value']
        master_sheet['D3'] = processed_data['stats']['record_count']
        master_sheet['D4'] = processed_data['stats']['schema']
        
        return {
            'success': True,
            'message': f"Successfully processed {processed_data['stats']['record_count']} records",
            'stats': processed_data['stats'],
            'output_sheet': f"{input_sheet_name}_cleaned"
        }
        
    except Exception as e:
        log_message(f"Error in master processing: {str(e)}", True)
        import traceback
        log_message(traceback.format_exc(), True)
        return {
            'success': False,
            'message': f"Error processing: {str(e)}"
        }

def main():
    """Main function to run the portfolio processor"""
    try:
        # Path to Excel file (when running directly)
        excel_file = "your_workbook.xlsx"
        
        # Open the workbook
        workbook = openpyxl.load_workbook(excel_file)
        
        # Process from Master sheet
        result = process_portfolio_from_master(workbook)
        
        if result['success']:
            log_message(f"Processing completed successfully: {result['message']}")
            log_message(f"Output sheet created: {result['output_sheet']}")
        else:
            log_message(f"Processing failed: {result['message']}", True)
        
        # Save the workbook
        workbook.save(excel_file)
        
    except Exception as e:
        log_message(f"Error in main function: {str(e)}", True)

if __name__ == "__main__":
    main()
