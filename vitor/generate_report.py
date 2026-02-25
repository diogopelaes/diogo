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

    report = collections.defaultdict(lambda: collections.defaultdict(int))
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "prontuarios_report.json")

    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()

        # Table name in Django: gestor_prontuarios
        query = """
            SELECT data_ocorrencia 
            FROM gestor_prontuarios 
            WHERE ocorrencia_disciplinar = True 
            AND data_ocorrencia IS NOT NULL
        """

        cur.execute(query)
        rows = cur.fetchall()

        for (data_ocorrencia,) in rows:
            # data_ocorrencia is a datetime object
            year = str(data_ocorrencia.year)
            month = f"{data_ocorrencia.month:02d}"
            report[year][month] += 1

        cur.close()
        conn.close()

        # Convert defaultdict to regular dict for JSON serialization
        final_report = {year: dict(months) for year, months in report.items()}

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(final_report, f, indent=4, ensure_ascii=False)

        print(f"Success: {output_path} generated.")
        print(
            f"Total occurrences found: {sum(sum(m.values()) for m in report.values())}"
        )

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    generate_report()
