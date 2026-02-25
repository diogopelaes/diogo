import psycopg2
import json
import collections
import os


def generate_report():
    conn_params = {
        "host": "localhost",
        "port": "5432",
        "database": "vitor_db",
        "user": "postgres",
        "password": "f&0(iO1F,15w",
    }

    # Report for Registro_Ocorrencia
    report = collections.defaultdict(lambda: collections.defaultdict(int))
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "ocorrencias_report.json")

    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()

        # Table name for Registro_Ocorrencia: gestor_registro_ocorrencia
        # Field: data_registro
        query = """
            SELECT data_registro 
            FROM gestor_registro_ocorrencia 
            WHERE data_registro IS NOT NULL
        """

        cur.execute(query)
        rows = cur.fetchall()

        for (data_registro,) in rows:
            # data_registro is a date object
            year = str(data_registro.year)
            month = f"{data_registro.month:02d}"
            report[year][month] += 1

        cur.close()
        conn.close()

        # Convert defaultdict to regular dict for JSON serialization
        final_report = {year: dict(months) for year, months in report.items()}

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(final_report, f, indent=4, ensure_ascii=False)

        print(f"Success: {output_path} generated.")
        print(
            f"Total Registro_Ocorrencia found: {sum(sum(m.values()) for m in report.values())}"
        )

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    generate_report()
