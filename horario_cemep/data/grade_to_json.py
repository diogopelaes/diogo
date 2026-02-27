import csv
import json
import os

def clean_data_row(row):
    # Remove espaços em branco das chaves e valores
    clean_row = {k.strip(): v.strip() for k, v in row.items() if k is not None}
    # Limpa o nome do professor se a chave existir
    if "nome do professor" in clean_row:
        clean_row["nome do professor"] = clean_row["nome do professor"].replace("Prof. ", "").replace("Profa. ", "")
    return clean_row

def csv_to_json(csv_file_path, json_file_path):
    data = []
    
    # Tentando abrir com utf-8-sig para lidar com BOM e caracteres especiais
    try:
        with open(csv_file_path, mode='r', encoding='utf-8-sig') as csvf:
            csvReader = csv.DictReader(csvf)
            for rows in csvReader:
                data.append(clean_data_row(rows))
    except Exception as e:
        print(f"Erro ao ler CSV com UTF-8: {e}")
        # Segunda tentativa com latin-1 se falhar
        try:
            with open(csv_file_path, mode='r', encoding='latin-1') as csvf:
                csvReader = csv.DictReader(csvf)
                data = [clean_data_row(rows) for rows in csvReader]
        except Exception as e2:
            print(f"Erro fatal ao ler CSV: {e2}")
            return

    # Escrita do JSON
    with open(json_file_path, mode='w', encoding='utf-8') as jsonf:
        json.dump(data, jsonf, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    # Caminhos relativos ao diretório do script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(current_dir, 'grade_horaria.csv')
    output_file = os.path.join(current_dir, '..', 'json', 'grade_horaria.json')
    
    if os.path.exists(input_file):
        print(f"Convertendo {input_file}...")
        csv_to_json(input_file, output_file)
        print(f"Sucesso! JSON gerado em: {output_file}")
    else:
        print(f"Erro: Arquivo '{input_file}' não encontrado no diretório: {current_dir}")
