defmodule TestProject do
  def hello(name) do

    :telemetry.execute(
      [:hello],
      %{name: name},
	  %{}
    )
	
    "Hello #{name}!"
  end
end
