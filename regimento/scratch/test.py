import os
import sys
import time
import subprocess
import unittest

# Check if selenium is installed
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError:
    print("Erro: A biblioteca 'selenium' nao esta instalada.")
    print("Instale com: pip install selenium")
    sys.exit(1)


class TestQuestionnaire(unittest.TestCase):
    server_process = None
    driver = None
    test_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(test_dir)
    download_dir = test_dir
    downloaded_file_path = os.path.join(test_dir, "resposta.md")

    BASE_URL = "http://127.0.0.1:8001"
    HOME_URL = f"{BASE_URL}/index.html"
    WIZARD_URL = f"{BASE_URL}/perguntas.html"

    @classmethod
    def setUpClass(cls):
        print("Iniciando servidor HTTP local na porta 8001...")
        cls.server_process = subprocess.Popen(
            [sys.executable, "-m", "http.server", "8001", "--bind", "127.0.0.1"],
            cwd=cls.project_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(1.5)

        print("Configurando Chrome Webdriver...")
        options = webdriver.ChromeOptions()
        prefs = {
            "download.default_directory": cls.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        options.add_experimental_option("prefs", prefs)
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            print("Fechando navegador...")
            cls.driver.quit()
        if cls.server_process:
            print("Encerrando servidor HTTP...")
            cls.server_process.terminate()
            cls.server_process.wait()
        if os.path.exists(cls.downloaded_file_path):
            print("Limpando arquivos temporarios de teste...")
            os.remove(cls.downloaded_file_path)

    def setUp(self):
        if os.path.exists(self.downloaded_file_path):
            os.remove(self.downloaded_file_path)

    def _wait_for_modal_and_confirm(self, wait):
        """Helper: wait for custom modal and click Confirmar."""
        wait.until(EC.visibility_of_element_located((By.ID, "confirm-modal")))
        confirm_btn = wait.until(EC.element_to_be_clickable((By.ID, "modal-btn-confirm")))
        confirm_btn.click()
        time.sleep(0.5)

    def _wait_for_modal_and_cancel(self, wait):
        """Helper: wait for custom modal and click Cancelar."""
        wait.until(EC.visibility_of_element_located((By.ID, "confirm-modal")))
        cancel_btn = wait.until(EC.element_to_be_clickable((By.ID, "modal-btn-cancel")))
        cancel_btn.click()
        time.sleep(0.5)

    def test_full_wizard_flow(self):
        driver = self.driver
        wait = WebDriverWait(driver, 10)

        # -------------------------------------------------------
        # 1. Open home page — expect "Iniciar Questionário" button
        # -------------------------------------------------------
        print("Navegando para a Home (index.html)...")
        driver.get(self.HOME_URL)
        self.assertIn("Questionário de Regimento Escolar", driver.title)

        wait.until(EC.visibility_of_element_located((By.ID, "view-home")))

        # Check orientation cards are loaded
        info_deve = driver.find_element(By.CSS_SELECTOR, ".info-card.deve h3")
        self.assertTrue(info_deve.is_displayed())

        # Button should say "Iniciar Questionário" (no previous progress)
        btn_action = driver.find_element(By.ID, "btn-action-main")
        self.assertIn("Iniciar", btn_action.text)
        print("Botao de acao exibe 'Iniciar Questionario' corretamente.")

        # -------------------------------------------------------
        # 2. Click "Iniciar" — should navigate to perguntas.html
        # -------------------------------------------------------
        print("Clicando em 'Iniciar Questionario'...")
        btn_action.click()
        wait.until(EC.url_contains("perguntas.html"))
        wait.until(EC.visibility_of_element_located((By.ID, "view-question")))
        print(f"Redirecionado para: {driver.current_url}")

        # -------------------------------------------------------
        # 3. Answer Question 1
        # -------------------------------------------------------
        print("Respondendo a pergunta 1...")
        q_text = driver.find_element(By.ID, "wizard-question-text").text
        self.assertIn("1.", q_text)

        options = driver.find_elements(By.CSS_SELECTOR, "#wizard-options-container .option-card")
        self.assertGreaterEqual(len(options), 2)
        options[0].click()
        time.sleep(0.5)

        textarea = driver.find_element(By.ID, "wizard-textarea")
        test_justification = "Justificativa de teste para a governanca do Conselho Escolar."
        textarea.send_keys(test_justification)
        time.sleep(0.5)

        status_label = driver.find_element(By.CSS_SELECTOR, "#wizard-status-indicator .status-label").text
        self.assertEqual("Respondida", status_label)

        # -------------------------------------------------------
        # 4. Advance to Question 2
        # -------------------------------------------------------
        print("Avancando para a pergunta 2...")
        driver.find_element(By.ID, "btn-nav-next").click()
        time.sleep(0.5)
        q2_text = driver.find_element(By.ID, "wizard-question-text").text
        self.assertIn("2.", q2_text)

        # -------------------------------------------------------
        # 5. Answer Q2 + test cancel on "Limpar essa resposta"
        # -------------------------------------------------------
        print("Respondendo a pergunta 2 (tema nao deve ser abordado)...")
        options = driver.find_elements(By.CSS_SELECTOR, "#wizard-options-container .option-card")
        bypass_option = next((o for o in options if "não deve ser abordado" in o.text), None)
        self.assertIsNotNone(bypass_option, "Opcao de exclusao do tema nao encontrada.")
        bypass_option.click()

        textarea = driver.find_element(By.ID, "wizard-textarea")
        textarea.send_keys("Justificativa temporaria Q2")
        time.sleep(0.5)

        status_label = driver.find_element(By.CSS_SELECTOR, "#wizard-status-indicator .status-label").text
        self.assertEqual("Respondida", status_label)

        # Test CANCEL on "Limpar essa resposta"
        print("Testando cancelamento do 'Limpar essa resposta'...")
        driver.find_element(By.ID, "btn-clear-current").click()
        self._wait_for_modal_and_cancel(wait)

        status_label = driver.find_element(By.CSS_SELECTOR, "#wizard-status-indicator .status-label").text
        self.assertEqual("Respondida", status_label, "Resposta deve continuar apos cancelar.")

        # Test CONFIRM on "Limpar essa resposta"
        print("Testando confirmacao do 'Limpar essa resposta'...")
        driver.find_element(By.ID, "btn-clear-current").click()
        self._wait_for_modal_and_confirm(wait)

        selected_options = driver.find_elements(By.CSS_SELECTOR, "#wizard-options-container .option-card.selected")
        self.assertEqual(0, len(selected_options), "Nenhuma opcao deve estar selecionada apos limpar.")
        self.assertEqual("", textarea.get_attribute("value"), "Textarea deve estar vazia apos limpar.")
        status_label = driver.find_element(By.CSS_SELECTOR, "#wizard-status-indicator .status-label").text
        self.assertEqual("Não respondida", status_label)

        # Re-answer Q2
        print("Re-respondendo a pergunta 2...")
        options = driver.find_elements(By.CSS_SELECTOR, "#wizard-options-container .option-card")
        bypass_option = next((o for o in options if "não deve ser abordado" in o.text), None)
        bypass_option.click()
        time.sleep(0.5)

        # -------------------------------------------------------
        # 6. Click "Voltar ao Menu" — should return to index.html
        # -------------------------------------------------------
        print("Voltando para a Home via 'Voltar ao Menu'...")
        driver.find_element(By.ID, "btn-nav-home").click()
        wait.until(EC.url_contains("index.html"))
        wait.until(EC.visibility_of_element_located((By.ID, "view-home")))
        print(f"Redirecionado para: {driver.current_url}")

        # -------------------------------------------------------
        # 7. Home should now show "Continuar respondendo"
        # -------------------------------------------------------
        btn_action = wait.until(EC.presence_of_element_located((By.ID, "btn-action-main")))
        self.assertIn("Continuar", btn_action.text)
        print("Botao de acao exibe 'Continuar respondendo' corretamente.")

        # -------------------------------------------------------
        # 8. Continue to wizard and verify progress
        # -------------------------------------------------------
        print("Continuando para a pagina de perguntas...")
        btn_action.click()
        wait.until(EC.url_contains("perguntas.html"))
        wait.until(EC.visibility_of_element_located((By.ID, "view-question")))

        progress_pct = driver.find_element(By.ID, "progress-text").text
        progress_count = driver.find_element(By.ID, "progress-count").text
        self.assertIn("1%", progress_pct)
        self.assertIn("2/181", progress_count)
        print(f"Progresso: {progress_pct} ({progress_count})")

        # -------------------------------------------------------
        # 9. Export resposta.md
        # -------------------------------------------------------
        print("Exportando respostas para resposta.md...")
        driver.find_element(By.ID, "btn-export").click()

        timeout = 8
        start_time = time.time()
        while not os.path.exists(self.downloaded_file_path):
            time.sleep(0.5)
            if time.time() - start_time > timeout:
                self.fail("Timeout esperando o download de resposta.md")
        print("Download concluido!")

        with open(self.downloaded_file_path, "r", encoding="utf-8") as f:
            md_content = f.read()
        self.assertIn(test_justification, md_content)
        self.assertIn("O tema não deve ser abordado no Regimento Escolar", md_content)

        # -------------------------------------------------------
        # 10. Clear all answers via modal
        # -------------------------------------------------------
        print("Limpando todas as respostas...")
        driver.find_element(By.ID, "btn-clear").click()
        self._wait_for_modal_and_confirm(wait)

        progress_pct = driver.find_element(By.ID, "progress-text").text
        progress_count = driver.find_element(By.ID, "progress-count").text
        self.assertIn("0%", progress_pct)
        self.assertIn("0/181", progress_count)

        # -------------------------------------------------------
        # 11. Go back to home and import the saved resposta.md
        # -------------------------------------------------------
        print("Voltando para a Home para importar respostas...")
        driver.find_element(By.ID, "btn-nav-home").click()
        wait.until(EC.url_contains("index.html"))
        wait.until(EC.visibility_of_element_located((By.ID, "view-home")))

        btn_action = driver.find_element(By.ID, "btn-action-main")
        self.assertIn("Iniciar", btn_action.text, "Botao deve dizer Iniciar apos limpar.")

        print("Importando respostas a partir do arquivo salvo...")
        btn_import = driver.find_element(By.ID, "btn-import")
        btn_import.send_keys(self.downloaded_file_path)
        time.sleep(1.5)

        # Button should now say "Continuar respondendo"
        btn_action = driver.find_element(By.ID, "btn-action-main")
        self.assertIn("Continuar", btn_action.text, "Botao deve dizer 'Continuar' apos importar.")
        print("Importacao restaurou o estado corretamente!")

        # -------------------------------------------------------
        # 12. Resume, open map, navigate to Q1 and verify data
        # -------------------------------------------------------
        print("Continuando para verificar restauracao das respostas...")
        btn_action.click()
        wait.until(EC.url_contains("perguntas.html"))
        wait.until(EC.visibility_of_element_located((By.ID, "view-question")))

        # Expand the question map and navigate to Q1
        driver.find_element(By.ID, "btn-toggle-map").click()
        time.sleep(0.5)
        dot1 = driver.find_element(By.ID, "grid-dot-0")
        dot1.click()
        time.sleep(0.5)

        selected_option = driver.find_element(By.CSS_SELECTOR, "#wizard-options-container .option-card.selected")
        self.assertTrue(selected_option.is_displayed(), "Opcao selecionada deve estar visivel.")

        textarea_val = driver.find_element(By.ID, "wizard-textarea").get_attribute("value")
        self.assertEqual(test_justification, textarea_val)

        print("Teste de fluxo completo executado com 100% de sucesso!")


if __name__ == "__main__":
    unittest.main()
