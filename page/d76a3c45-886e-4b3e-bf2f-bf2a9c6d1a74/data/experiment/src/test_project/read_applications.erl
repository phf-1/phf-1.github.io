-module(read_applications).
-export([main/1]).

main([FileName]) ->
    {ok,ApplicationSpecification} = file:consult(FileName),
    [{application, _AppName, AppData}] = ApplicationSpecification,
    {applications, Applications} = lists:keyfind(applications, 1, AppData),
    io:format("~p~n", [Applications]).
